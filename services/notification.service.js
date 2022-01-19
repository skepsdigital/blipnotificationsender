const uuid = require('uuid');
const axios = require('axios');

module.exports.sendNotification = async (botKey, phone) => {
    try {
        let user = await this.getUserIdentifier(botKey, phone);

        if(!user) throw new Error('Falha ao buscar identificador do usuário');

        await this.triggerNotification(botKey, user, 'doakodosa', '231321');
        
        return user;
    } catch(e) {
        throw new Error('Falha ao enviar notificação');
    }
}

module.exports.getUserIdentifier = async (botKey, phone) => {
    try {
        let response = await axios.post('https://http.msging.net/commands', {
                "id": uuid.v1(), 
                "to": "postmaster@wa.gw.msging.net", 
                "method": "get", 
                "uri": "lime://wa.gw.msging.net/accounts/" + phone 
        },
            { 
                headers: {
                    'Authorization': 'Key ' + botKey
                } 
            }
        );

        if(response.status != 200) throw new Error('Falha ao buscar identificador do usuário');

        if(response.data && response.data.resource && response.data.resource.alternativeAccount) {
            return response.data.resource.alternativeAccount;
        }

        return null;
    } catch(e) {
        throw new Error(e.message);
    }
}

module.exports.triggerNotification = async (botKey, userIdentifier, namespace, templateName) => {
    try {
        
        let result = await axios.post('https://http.msging.net/messages',
            {
                "id": uuid.v1(),
                "to": userIdentifier,
                "type":"application/json",
                "content":
                {
                    "type":"template",
                    "template":
                    {
                        "namespace": namespace,
                        "name": templateName,
                        "language":{
                            "code":"pt_BR",
                            "policy":"deterministic"
                        },
                        "components":[
                            {
                                "type": "body",
                                "parameters": [
                                    {
                                        "type": "text",
                                        "text": "Alan Oliveira"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }, { 
                headers: {
                    'Authorization': 'Key ' + botKey
                } 
            }
        );

        return result;

    } catch(e) {
        throw new Error('Falha ao enviar notificação');
    }
}