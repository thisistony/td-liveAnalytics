# liveAnalytics utilising Amazon Web Services.

This repo contains examples of AWS Lambda workers that will enable you to track anything in realtime as long as you can attach it to a trigger using Google Tag Manager.

## Pre-requisites

 - Google Tag Manager
 - AWS Lambda
 - AWS DynamoDB
 - AWS API Gateway
 - AWS Cloudwatch

## The anatomy of this repo

Two Node.js files are required to be uploaded onto AWS Lambda - one to upload data when a trigger has been triggered and the other file is to download the data, both to be attached onto different API Gateway endpoints.

It is highly recommended that for the API Gateway download function, an API Gateway key is attached to protect your data. It is not necessary to attach an API key when recording the data.  

## How to deploy

 1. Create your own DynamoDB database with `ctimestamp` as primary partition key. *(It is essential that you don't use 'timestamp' as your primary partition key as it's a reserved keyword.)* - note down your database name.
 2. Depending on your data, you may need a primary sort key.
 3. Create a new Lambda function and upload the repo, replacing the DynamoDB database name where required.
 4. Create an API Gateway API and attach it to your newly created Lambda function.
 5. Test to see if the data is being recorded in your database.
 6. Call your API endpoint using Google Tag Manager and attach it to a trigger of your liking.
