import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';

interface LambdaConstructProps extends cdk.StackProps {

}

export class LambdaConstruct extends cdk.Construct {

    public readonly cleanup: lambda.Function;
    public readonly emailFunction: lambda.Function;
    public readonly encryptionFunction: lambda.Function;
    public readonly reportGenerate: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props?: LambdaConstructProps) {
        super(scope, id);

        // @ts-ignore
        this.cleanup = new lambda.Function(this, 'cleanupFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '..', 'functions', 'Globomantics-cleanup')),
        });

        // @ts-ignore
        this.emailFunction = new lambda.Function(this, 'emailFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '..', 'functions', 'Globomantics-email-function')),
        });

        // @ts-ignore
        this.encryptionFunction = new lambda.Function(this, 'encryptionFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '..', 'functions', 'Globomantics-encryption-function')),
        });

        // @ts-ignore
        this.reportGenerate = new lambda.Function(this, 'reportGenerateFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '..', 'functions', 'Globomantics-report-generate')),
        });





    }
}