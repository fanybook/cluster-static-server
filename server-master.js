const config = require('./config-master.js');
const proxy = require('fastify-http-proxy');
const server = require('fastify')({
  logger: config.logger
});

for(var i=0;i<config.nodeServer.length;i++) {
  server.register(proxy, config.nodeServer[i]);
}

// Hooks
server.addHook('onRequest', (request, reply, done) => {
  if(request.raw.method !== 'GET') {
    if(request.headers.x_token===config.x_token){
      done();
    } else {
      reply.code(400).send({status:400,message:'Bad Request!'});
    }
  } else {
    done();
  }
});

server.register(require('fastify-file-upload'), {
  limits: { fileSize: config.limitSize },
  useTempFiles : true,
  tempFileDir : 'temp/'
});

server.register(require('./routes/default.js'));
server.register(require('./routes/master.js'));

// Custom Error Handler
server.setErrorHandler(function (error, request, reply) {
  server.log.error(error);
  reply.send({status:500,message:'Whoops, Something went wrong!'});
});

server.listen(config.masterPort, function (err, address) {
  if (err) {
      server.log.error(err);
      process.exit(1);
  }
});