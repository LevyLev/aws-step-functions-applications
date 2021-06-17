import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import { LambdaConstruct } from "./lambdaConstruct";

interface StepFunctionConstructProps extends cdk.StackProps {

}

export class StepFunctionConstruct extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, lambdaConstruct: LambdaConstruct, props?: StepFunctionConstructProps) {
        super(scope, id);

        const reportGenerate = new tasks.LambdaInvoke(this, 'GenerateClientReport', {
            lambdaFunction: lambdaConstruct.reportGenerate,
            resultPath:'$.reportGenerationOutput'
        });

        const mapEmailPathForUnEncryptedReport = new sfn.Pass(this, 'MapEmailPathForUnEncryptedReport', {
            parameters : {
                emailFile: sfn.JsonPath.stringAt('$.reportGenerationOutput.Payload'),
                unencryptedFile: sfn.JsonPath.stringAt('$.reportGenerationOutput.Payload')
            },
            resultPath: '$.reportOptions.reportData'
        });

        const encryptReport = new tasks.LambdaInvoke(this, 'EncryptReport', {
            lambdaFunction: lambdaConstruct.encryptionFunction,
            payload: sfn.TaskInput.fromObject({
                reportFile: sfn.JsonPath.stringAt('$.reportOptions.reportData.unencryptedFile')
            }),
            resultPath: '$.encryptionOutput'
        })

        const mapEmailPathForEncryptedReport = new sfn.Pass(this, 'MapEmailPathForEncryptedReport', {
            parameters : {
                emailFile: sfn.JsonPath.stringAt('$.encryptionOutput.Payload'),
                encryptedFile: sfn.JsonPath.stringAt('$.encryptionOutput.Payload'),
                unencryptedFile: sfn.JsonPath.stringAt('$.reportGenerationOutput.Payload')
            },
            resultPath: '$.reportOptions.reportData'
        });

        const emailReport = new tasks.LambdaInvoke(this, 'EmailReport', {
            lambdaFunction: lambdaConstruct.emailFunction,
            payload: sfn.TaskInput.fromObject({
                emailFile: sfn.JsonPath.stringAt('$.reportOptions.reportData.emailFile'),
                clientEmail: sfn.JsonPath.stringAt('$.reportOptions.clientEmail'),
                emailSubject: sfn.JsonPath.stringAt('$.reportOptions.emailSubject'),
                emailBody: sfn.JsonPath.stringAt('$.reportOptions.emailBody')
            }),
            resultPath: '$.emailOutput'
        });

        const cleanup = new tasks.LambdaInvoke(this, 'Cleanup', {
           lambdaFunction:lambdaConstruct.cleanup,
           payload: sfn.TaskInput.fromObject({
               files: {
                   encryptedFile: sfn.JsonPath.stringAt('$.reportOptions.reportData.encryptedFile'),
                   unencryptedFile: sfn.JsonPath.stringAt('$.reportOptions.reportData.unencryptedFile')
               }
           }),
            resultPath: '$.cleanupOutput'
        });

        const shouldEncrypt = new sfn.Choice(this, 'ShouldEncrypt');

        const conditionShouldEncryptTrue = sfn.Condition.booleanEquals('$.reportOptions.shouldEncrypt', true);
        const conditionShouldEncryptFalse = sfn.Condition.booleanEquals('$.reportOptions.shouldEncrypt', false);

        // shouldEncrypt.when(sfn.Condition.booleanEquals('$.reportOptions.shouldEncrypt', true), encryptReport
        //     .next(mapEmailPathForEncryptedReport))
        //     .when(sfn.Condition.booleanEquals('$.reportOptions.shouldEncrypt', false), emailReport)
        //
        // shouldEncrypt.afterwards()
        //     .next(cleanup)


        const definition = reportGenerate
            .next(mapEmailPathForUnEncryptedReport)
            .next(shouldEncrypt
                .when(conditionShouldEncryptTrue, encryptReport
                    .next(mapEmailPathForEncryptedReport)
                    .next(emailReport))
                .when(conditionShouldEncryptFalse, emailReport)
                .afterwards()
                .next(cleanup));

        new sfn.StateMachine(this, 'Glomonatics-report-generation-workflow-tutorial', {
            definition
        });



    }
}