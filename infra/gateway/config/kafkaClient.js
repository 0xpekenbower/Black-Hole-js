import { Kafka } from "kafkajs";
import { kafka as kafkaConfig } from "./index.js";

const kafka = new Kafka({
    clientId: kafkaConfig.clientId,
    brokers: kafkaConfig.brokers
});

export default kafka; 


/*
    notifications topic 

    notiftype: friend_ship , chat
    sender_id:
    receiver_id:

    notif flow: 
    1- dash service send notification to kafka 
    2- gateway consume notification from kafka 
    3- gateway check if receiver_id is online if yes get socket id of receiver_id from redis 
    4- gateway send notification to receiver_id using socket id and save notification in db
    5- frontend consume notification from socket display notification and update content of page
    6- when notification is become readed update notification in db to add flag readed 
    7- if receiver_id is not online hold notification in db with flag unreaded 
    8- when receiver_id come online get all notification from db and for add mark unreaded to unreaded notifications 

    so redis will be used only for save socket id of user , and when user come offline remove socket id from redis 
    the key will be user_id and the value will be socket id 
*/