# Course-Database-Demo
* 此專案為國立臺北護理健康大學資訊管理系大二資料庫管理系統課程範例程式

* 教學說明影片: https://www.youtube.com/watch?v=WJTRE3RXABc

## 執行
1. 安裝MS-SQL
 - 設定MS-SQL登入帳號與密碼，請至`data/config.js`設定

 ```js
 module.exports = {
    HTTPServer: {
        "viewsRoot": "../views",
        "httpPort": 80,
        "timeout": 30000
    },
    BUILD_MODE: "PRODCUTION", // DEBUG, VERBOSE, PRODCUTION 
    LOG_PATH: "/data/log/debug.log",
    mssql: {
        "BANK": { 
            "user": "sa",
            "password": "ntunhsim", 
            "server": "localhost\\SQLEXPRESS",
            "database": "BANK"
        }
    }
};
 ```
 - 安裝完後請設定防火牆以及開啟MS-SQL認證
 - 確認MS-SQL連線是否正確
 -執行`BaseScript.sql`初始化資料庫

2. 下載node.js，此使用版本為 v10.15.1
3. clone source & 初始化程式
```
git clone https://github.com/cylab-tw/Course-Database-Demo.git
npm install

```

4.  執行
 - (1) 使用nod.js開啟
```
cd/app
node server.js
```

- (2) 使用pm2開啟(需先下載pm2)

- 啟動
```
cd/app
pm2 start server.js
```

- 刪除
```
cd/app
pm2 kill
```

5. 開啟網頁
```
http://localhost:{port}
```
 - 登入帳號&密碼: admin/1 (請參考`models/user.passport.js`)
