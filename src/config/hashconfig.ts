interface IHashOption {
    saltRounds: number;
}

const hashOptions: IHashOption = {
    saltRounds: 10
};

export default hashOptions;