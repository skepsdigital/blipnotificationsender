const uuid = require('uuid');
const axios = require('axios');

module.exports.sendNotification = async (botKey, chabotid, phone, namespace, templatename, userData) => {
    try {
        let user = await this.getUserIdentifier(botKey, phone);

        if(!user) throw new Error('Falha ao buscar identificador do usuário');

        await this.triggerNotification(botKey, user, namespace, templatename, userData.templateParams);

        if(userData.contactExtras) {
            await this.setUserDetails(botKey, user, userData.contactExtras);
        }

        await this.setUserMasterState(botKey, user, chabotid);
        await this.setUserState(botKey, user, userData.flowId, userData.stateId);

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

module.exports.triggerNotification = async (botKey, userIdentifier, namespace, templateName, params) => {
    try {
        let body = {
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
                    "components":[]
                }
            }
        };

        for(let param of params) {
            body['content']['template']['components'].push({
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "text": param
                    }
                ]
            })
        }
        
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

module.exports.setUserMasterState = async (botKey, userIdentifier, botId) => {
    try {
        let result = await axios.post('https://http.msging.net/commands', {
            "id": uuid.v1(),
            "method": "set",
            "uri": "/contexts/" + userIdentifier + "/master-state",
            "type": "text/plain",
            "resource": botId + "@msging.net"
          }, { 
                headers: {
                    'Authorization': 'Key ' + botKey
                } 
            }
        );
        
        return result;
    } catch(e) {
        throw new Error('Falha ao estado master status do usuário');
    }
}

module.exports.setUserState = async (botKey, userIdentifier, flowId, stateId) => {
    try {
        let result = await axios.post('https://http.msging.net/commands',
            {
                "id": uuid.v1(),
                "method": "set",
                "uri": "/contexts/" + userIdentifier + "/stateid%40" + flowId,
                "type": "text/plain",
                "resource": "06c03812-ed0b-4b43-9319-70fc5681da40"
            }, { 
                headers: {
                    'Authorization': 'Key ' + botKey
                } 
            }
        );
        return result;
    } catch(e) {
        throw new Error('Falha ao atualizar estado do usuário');
    }
}

module.exports.setUserDetails = async(botKey, userIdentifier, userData) => {
    try {
        
        let result = await axios.post('https://http.msging.net/commands',
        {
            "id": uuid.v1(),
            "method": "merge",
            "uri": "/contacts",
            "type": "application/vnd.lime.contact+json",
            "resource": {
                "identity": userIdentifier,
                "extras": userData
            }
        },
        { 
            headers: {
                'Authorization': 'Key ' + botKey,
                'Content-Type': 'application/json'
            }
        });

        return result;
    } catch(e) {
        throw new Error('Erro ao atualizar detalhes do usuário');
    }
}