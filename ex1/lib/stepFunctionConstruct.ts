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

        const step1Job = new tasks.LambdaInvoke(this, 'Step 1', {
            lambdaFunction: lambdaConstruct.step1,
            outputPath: '$.Payload'
        });

        const step2Job = new tasks.LambdaInvoke(this, 'Step 2', {
            lambdaFunction: lambdaConstruct.step2,
            outputPath: '$.Payload'
        });

        const definition = step1Job.next(step2Job);

        new sfn.StateMachine(this, 'StateMachine', {
            definition,
            timeout: cdk.Duration.minutes(5)
        });

    }
}