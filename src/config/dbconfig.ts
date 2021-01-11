interface IMysqlConfig {
    host: string;
    user: string;
    password: string;
    database: string;
}

var mysqlConfig: IMysqlConfig = {
    host: "us-cdbr-east-02.cleardb.com",
    user: "b81bb2a43eb405",
    password: "b08966f5",
    database: "heroku_cc534c2a327b39d"
};

export default mysqlConfig;