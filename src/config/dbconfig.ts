interface IMysqlConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
    multipleStatements: boolean;
}

var mysqlConfig: IMysqlConfig = {
    host: "us-cdbr-east-02.cleardb.com",
    user: "b81bb2a43eb405",
    password: "b08966f5",
    database: "heroku_cc534c2a327b39d",
    connectionLimit : 10,              
    multipleStatements : true  
};

export default mysqlConfig;