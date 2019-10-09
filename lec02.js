// function run() {
//     console.log('3초 지나고 실행.');
// }
// console.log('시작');
// setTimeout(run,3000);
// console.log('끝');

const http = require('http');

const server = http.createServer((req,res)=>{
    res.writeHead(200, {'content-type' : 'text/plain'});
    res.write('Hello nodejs!');
    res.end();
}).listen(3000, ()=>{
    console.log('server on!');
})
