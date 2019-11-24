## 개요

NL Node.js 스터디

예제3입니다.

### 시작하기 전

.gitignore 에서 config 폴더가 github repository 에 올라가는 것을 방지합니다.

(그러므로 앞으로, AWS RDS의 ID나 PW, AWS IAM 등 민감한 정보들을 담는 파일은 모두 config폴더에 작업합니다,)

프로젝트의 최상위(routes, app.js 등의 폴더와 같은 위치)에 만들어줍니다.

config/dbConfig.js

```javascript
const mysql = require('promise-mysql');
const config = {
    host: 'AWS RDS 주소',
    port: 3306,
    user: 'ID',
    password: 'PW',
    database: 'DB 스키마 이름',
    connectionLimit : 100,
    waitForConnection : true
}



module.exports = mysql.createPool(config);
```

이 파일을 넣어 줍니다.

### pool의 이해

routes/signUp.js

```javascript
var express = require('express');
var router = express.Router();
const pool = require('../module/pool'); // 만든 모듈

router.post('/', async (req,res)=>{
    let name = req.body.name;
    let age = req.body.age;
    let gender = req.body.gender;

    /* 'INSERT INTO TABLE명 (칼럼들) VALUES (실제로 넣을값)' */
    const signupQuery = 'INSERT INTO user (userName, userAge, userGender) VALUES (?,?,?)';
    
    /* 'SELECT 가져올값 FROM 테이블명 WHERE 조건' */
    const findAlreadyQuery = 'SELECT * FROM user WHERE userName=?';
    const findAlreadyResult = await pool.queryParam_Arr(findAlreadyQuery, [name]);
    
    console.log(findAlreadyResult);
    if(!findAlreadyResult) { // 신규인 경우
        await pool.queryParam_Arr(signupQuery, [name, age, gender]);
        res.send('가입 끝');
        res.end();
    }
    else { //가입이 이미 된 경우
        res.send('이미 가입이 됐음');
        res.end();
    }

})

module.exports = router;
```

위는 DB와의 연동을 바탕으로 서버가 DB에 CRUD 작업을 할 수 있게 하는 간단한 코드입니다.

우리는 await pool.queryParam_Arr(쿼리질의문, [값,값,값,....]) 이 

"아, 쿼리문 실행하는 곳이구나."

라고 직관적으로 생각할 수 있습니다.



하지만 이해하고 넘어가야 합니다.

앞서 config/dbConfig.js 에서, 우리는

```javascript
module.exports = mysql.createPool(config);
```



을 봤습니다.

mysql의 연결 방식은 connection 방식과 pool 방식 두개가 있었고, 그 중에 우린 pool방식을

채용하기로 했었습니다. 그쵸?

`pool = 여러개의 connection을 담고 있는 수영장!`

우리의 주소와 DB 정보등을 담고 있는 config를 매개변수로, mysql 모듈의 createPool이라는 함수를 실행하는 것입니다.

이제 pool 모듈을 보겠습니다.

`module/pool.js의 일부`

```javascript
const pool = require('../config/dbConfig');

module.exports = { // 두 개의 메소드 module화
    queryParam_Arr: async(...args) => {
        const query = args[0];
        const value = args[1]; // array
        let result;

        try {
            var connection = await pool.getConnection(); // connection을 pool에서 하나 가져온다.
            result = await connection.query(query, value) || null; // 두 번째 parameter에 배열 => query문에 들어갈 runtime 시 결정될 value
        } catch (err) {
            console.log('query err : ' + err);
            connection.rollback(() => {});
            next(err);
        } finally {
            pool.releaseConnection(connection); // waterfall 에서는 connection.release()를 사용했지만, 이 경우 pool.releaseConnection(connection) 을 해준다.
            return result;
        }
    }
};
```

- 값을 담을 수 있는 queryParam_Arr을 예로 듭니다.

먼저, ...args 는 여러 가지의 argument를 담을 수 있는 곳입니다.

이는 콤마(,) 로 구분됩니다. 따라서

`const query = args[0]`

`const value = args[1];`

는 본문에서 실제로 쓰일 때

`await pool.queryParam_Arr(쿼리질의문, [값, 값, 값])`

의 식으로 쓰이는 것입니다.

만약에 값이 필요 없다면(== 조건이 필요 없다면)

`await pool.queryParam_None(쿼리질의문)`

을 사용합니다.

try {  } 구문 내에서 ```await pool.getConnection()```으로 하나의 커넥션을 가져온 후,

`connection.query(query, value);` 로 쿼리질의문을 실행합니다.

catch {  } 구문 내에서 에러를 콘솔에 찍어준 후, rollback을 통해 DB에 끼쳤던 영향들을

다시 되돌려줍니다.

finally { } 구문 내에서 `pool.releaseConnection(connection)`

을 통해 커넥션을 다시 release 해줍니다.

### Async/await

```javascript
router.post('/', async (req,res)=>{
    await 할일1;
    await 할일2;
    await 할일3;
})
```

이전 과제를 통해, 우리는 흐름제어의 필요성을 느꼈습니다. 그리고 Async/await를 배웠습니다.

이를 꼭 사용해주세요.

### 과제

이번 과제는 서버다운 서버를 구축하고, DB의 첫발을 딛는 아주 중요한 과제입니다.

중요한 점은,

- response는 무조건 해주세요.
- async/await 를 활용한 흐름 제어 해주세요.
- 처음으로 사용해보는 HTTP Method 중 하나인 DELETE를 구현합니다. 
- 테스트는 포스트맨에서 POST 대신 DELETE를 사용해주시면 됩니다.
- 제출은 2019년 11월 29일(금) 0시 까지입니다.

