import creditModel from "../model/credit.model.js";
import ApiError from "../utils/ApiError.js";

const getCredit = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(id);
        if (!id) {
            next(ApiError.badRequest("Please provide a id"));
        }
        const credit = await creditModel.findOne({user:id});
        if (!credit) {
            next(ApiError.badRequest("No credit found with this id"));
        }
        console.log(credit);
        res.status(200).json({
            success: true,
            data: credit
        }
        );
    } catch (err) {
        next(ApiError.internal(err.message));
    }
}

export {getCredit};


