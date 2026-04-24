const express = require("express");
const { protect } = require("../middleware/auth");

module.exports = (io) => {
    const router = express.Router();
    const {
        createClaim, getClaimsForItem, getMyClaims, updateClaimStatus
    } = require("../controllers/claimController")(io);

    router.post("/", protect, createClaim);
    router.get("/my", protect, getMyClaims);
    router.get("/item/:itemId", protect, getClaimsForItem);
    router.put("/:id", protect, updateClaimStatus);

    return router;
};