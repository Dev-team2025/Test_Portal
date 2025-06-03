// models/UserAnswer.js
module.exports = (sequelize, DataTypes) => {
    const UserAnswer = sequelize.define('UserAnswer', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        quiz_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        selected_option: {
            type: DataTypes.STRING,
            allowNull: false
        },
        is_correct: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'user_answers',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return UserAnswer;
};
