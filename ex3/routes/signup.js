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