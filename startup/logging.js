const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

module.exports = function(){
        // Error Logging in Express
    winston.add(new winston.transports.File({filename:'./logs/application.log'}));
    winston.add(new winston.transports.Console({colorize:true,prettyPrint:true}));
    winston.add(new winston.transports.MongoDB({
        db:'mongodb://localhost/vidly',
        level: 'error'
    }));

    // winston only logs errors that are a part of req processing pipeline in express
    // it will not log errors outside of this context e.g.
    // throw new error('error'); // here will not be logged
    // to catch and log node process errors:

    // process.on('uncaughtException', (ex) => {
    //     // this only works with synchronous code and rejected promises will not trigger this
    //     console.log('we got an uncaught exception boys, take em away!');
    //     winston.error(ex.message, {metadata:ex});
    //     process.exit(1); // 0 means success // anything but 0 means failure
    // });
    // process.on('unhandledRejection', (ex) => { // for promises
    //
    //     console.log('we got an uncaught rejection boys, take em away!');
    //     winston.error(ex.message, {metadata:ex});
    //     process.exit(1);
    // });

    // OR preferably :
    winston.exceptions.handle(
        new winston.transports.Console({colorize:true,prettyPrint:true}),
        new winston.transports.File({filename:'./logs/uncaughtExceptions.log'}));
    const logger = winston.createLogger();
    logger.rejections.handle(
        new winston.transports.Console({colorize:true,prettyPrint:true}),
        new winston.transports.File({filename:'./logs/uncaughtRejections.log'}));
    // this crashes for some reason:
    // winston.rejections.handle(new winston.transports.File({filename:'./logs/uncaughtRejections.log'}));
}