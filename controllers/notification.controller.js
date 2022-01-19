const formidable = require("formidable");
const express = require("express");
const router = express.Router();
const notificationService = require('../services/notification.service');
const csvService = require('../services/csv.service');

router.post('/:chatbotid/:namespace/:template', async (req, res) => {

    try {
        if(!req.body) throw new Error('Envie os dados da regra.');
        
        let result = await notificationService.sendNotification(req.headers.authorization, req.params.chatbotid, req.body.phone, req.params.namespace, req.params.template, req.body);

        return res.status(200).send({
            status: 'success',
            data: result
        });

    } catch(e) {
        
        res.status(400).send({
            status: 'error',
            data: {},
            error: e.message
        });
    }
});


module.exports = router;
