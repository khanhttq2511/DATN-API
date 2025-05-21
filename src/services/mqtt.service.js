const mqtt = require('mqtt');

class MQTTService {
    constructor() {
        this.client = null;
    }

    connect(config, onSuccess, onError) {
        if (this.client && this.client.connected) {
            console.log("🚀 Đã kết nối MQTT rồi!");
            return;
        }

        this.client = mqtt.connect({
            host: config.host,
            port: config.port,
            protocol: config.protocol,
            clientId: config.clientId || `mqtt_client_${Math.random().toString(16).substr(2, 8)}`,
            username: config.username,
            password: config.password,
            keepalive: config.keepalive || 60,
            reconnectPeriod: 5000, // Tự động thử lại sau 5s nếu mất kết nối
            clean: true // Đảm bảo kết nối mới không nhớ subscriptions cũ
        });

        this.client.on('connect', () => {
            console.log('✅ MQTT Connected!');
            if (onSuccess) onSuccess(this.client);
        });

        this.client.on('error', (error) => {
            console.error('❌ Lỗi MQTT:', error);
            this.client.end();
            if (onError) onError(error);
        });

        this.client.on('reconnect', () => {
            console.warn('⚠️ MQTT Đang thử kết nối lại...');
        });

        this.client.on('close', () => {
            console.warn('⚠️ MQTT Đã đóng kết nối!');
        });

        this.client.on('offline', () => {
            console.warn('⚠️ MQTT Đã offline, thử kết nối lại...');
        });
    }

    subscribe(topic, callback) {
        if (!this.client || !this.client.connected) {
            console.error('🚨 Không thể subscribe, MQTT chưa kết nối!');
            return;
        }
        console.log(`📡 Đang cố gắng subscribe vào topic: ${topic}`);
        this.client.subscribe(topic, (err) => {
            if (err) {
                console.error(`❌ Lỗi khi subscribe vào ${topic}:`, err);
            } else {
                console.log(`📥 Đã subscribe vào topic: ${topic}`);
            }
        });

        this.client.on('message', (receivedTopic, message) => {
            if (receivedTopic === topic) {
                console.log(`📩 Tin nhắn từ ${topic}:`, message.toString());
                if (callback) callback(message.toString(), receivedTopic);
            }
        });
    }

    publish(topic, message, options = {}) {
        if (!this.client || !this.client.connected) {
            console.error('🚨 Không thể gửi tin nhắn, MQTT chưa kết nối!');
            return;
        }

        const payload = typeof message === 'string' ? message : JSON.stringify(message);
        this.client.publish(topic, payload, options, (err) => {
            if (err) {
                console.error(`❌ Lỗi khi gửi tin nhắn tới ${topic}:`, err);
            } else {
                console.log(`📤 Tin nhắn đã gửi tới ${topic}:`, payload);
            }
        });
    }

    disconnect() {
        if (this.client) {
            console.log('🔌 Đang ngắt kết nối MQTT...');
            this.client.end();
        }
    }
}

module.exports = new MQTTService();