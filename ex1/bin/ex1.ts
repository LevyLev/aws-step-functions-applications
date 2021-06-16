#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Ex1Stack } from '../lib/ex1-stack';

/* Capitolul 2 , videoul "Creating AWS Step Function Workflow" */

const app = new cdk.App();
new Ex1Stack(app, 'Ex1Stack', {

});
