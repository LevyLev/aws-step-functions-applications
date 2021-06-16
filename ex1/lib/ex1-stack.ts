import * as cdk from '@aws-cdk/core';
import { LambdaConstruct } from "./lambdaConstruct";
import {StepFunctionConstruct} from "./stepFunctionConstruct";

export class Ex1Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaConstruct = new LambdaConstruct(this,'myLambdaConstruct');
    const stepFunctionConstruct = new StepFunctionConstruct(this, 'myStepFunction', lambdaConstruct);
  }
}
