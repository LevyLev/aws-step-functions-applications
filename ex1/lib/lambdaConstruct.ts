import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';

interface LambdaConstructProps extends cdk.StackProps {

}

export class LambdaConstruct extends cdk.Construct {

    public readonly step1: lambda.Function;
    public readonly step2: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props?: LambdaConstructProps) {
        super(scope, id);

        this.step1 = new lambda.Function(this, 'MyFirstFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'step1.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '..', 'functions')),
        });

        this.step2 = new lambda.Function(this, 'MySecondFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'step2.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '..', 'functions')),
        });



    }
}