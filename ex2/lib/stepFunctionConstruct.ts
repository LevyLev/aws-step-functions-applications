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

        // @ts-ignore
        const reportGenerate = new tasks.LambdaInvoke(this, 'GenerateClientReport', {
            lambdaFunction: lambdaConstruct.reportGenerate,
            resultPath:'$.reportGenerationOutput'
        });

        // @ts-ignore
        const mapEmailPathForUnEncryptedReport = new sfn.Pass(this, 'MapEmailPathForUnEncryptedReport', {
            parameters : {
                emailFile: '$.reportGenerationOutput.Payload',
                unencryptedFile: '$.reportGenerationOutput.Payload'
            },
            resultPath: '$.reportOptions.reportData'
        });

        // @ts-ignore
        const encryptReport = new tasks.LambdaInvoke(this, 'EncryptReport', {
            lambdaFunction: lambdaConstruct.encryptionFunction,
            payload: sfn.TaskInput.fromObject({
               reportFile: '$.reportOptions.reportData.unencryptedFile'
            }),
            resultPath: '$.encryptionOutput'
        })

        const mapEmailPathForEncryptedReport = new sfn.Pass(this, 'MapEmailPathForEncryptedReport', {
            parameters : {
                emailFile: '$.encryptionOutput.Payload',
                encryptedFile:'$.encryptionOutput.Payload',
                unencryptedFile: '$.reportGenerationOutput.Payload'
            },
            resultPath: '$.reportOptions.reportData'
        });

        const emailReport = new tasks.LambdaInvoke(this, 'EmailReport', {
            lambdaFunction: lambdaConstruct.emailFunction,
            payload: sfn.TaskInput.fromObject({
                emailFile:'$.reportOptions.reportData.emailFile',
                clientEmail:'$.reportOptions.clientEmail',
                emailSubject:'$.reportOptions.emailSubject',
                emailBody:'$.reportOptions.emailBody'
            }),
            resultPath: '$.emailOutput'
        });

        const cleanup = new tasks.LambdaInvoke(this, 'Cleanup', {
           lambdaFunction:lambdaConstruct.cleanup,
           payload: sfn.TaskInput.fromObject({
               files: {
                   encryptedFile:'$.reportOptions.reportData.encryptedFile',
                   unencryptedFile: '$.reportOptions.reportData.encryptedFile'
               }
           }),
            resultPath: '$.cleanupOutput'
        });

        const shouldEncrypt = new sfn.Choice(this, 'ShouldEncrypt');

        shouldEncrypt.when(sfn.Condition.booleanEquals('$.reportOptions.shouldEncrypt', true), encryptReport
            .next(mapEmailPathForEncryptedReport))

        shouldEncrypt.afterwards()
            .next(emailReport)
            .next(cleanup)
        //shouldEncrypt.when(sfn.Condition.booleanEquals('$.reportOptions.shouldEncrypt', false), emailReport);


        const definition = reportGenerate
            .next(mapEmailPathForUnEncryptedReport)
            .next(shouldEncrypt);

        // @ts-ignore
        new sfn.StateMachine(this, 'Glomonatics-report-generation-workflow-tutorial', {
            definition
        });



    }
}