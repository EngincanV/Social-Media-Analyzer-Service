interface IMysqlConfig {
    host: string;
    user: string;
    password: string;
    database: string;
}

var mysqlConfig: IMysqlConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "SocialMediaAnalyzer"
};

export default mysqlConfig;