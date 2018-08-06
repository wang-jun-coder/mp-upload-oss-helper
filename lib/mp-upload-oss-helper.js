const crypto = require('crypto');

class MpUploadOssHelper {
    /**
     * 构造方法
     *
     * @author 王俊
     * @date 2018-08-01
     *
     * @param {Object} options
     * @param {String} options.accessKeyId   oss 的 accessKeyId
     * @param {String} options.accessKeySecret  oss 的 accessKeySecret
     * @param {Number} [options.timeout]    生成参数的有效期, 单位: 小时, 默认为 1h
     * @param {Number} [options.maxSize]    上传资源的最大限制, 单位: Mb, 默认为 10Mb
     */
    constructor(options) {
        this.accessKeyId = options.accessKeyId;
        this.accessKeySecret = options.accessKeySecret;
        this.timeOut = options.timeout || 1;
        this.maxSize = options.maxSize || 10;
    }

    /**
     * 生成微信小程序上传所需的参数
     *
     * 参考 oss 文档: https://help.aliyun.com/document_detail/31988.html?spm=a2c4g.11186623.2.4.gHg0jU
     *
     * @author 王俊
     * @date 2018-08-01
     *
     * @return {Object} params
     */
    createUploadParams() {
        const policy = this.getPolicyBase64();
        const signature = this.signature(policy);
        const objectKey =  Date.now().toString();
        return {
            key: objectKey,
            policy: policy,
            OSSAccessKeyId: this.accessKeyId,
            signature: signature
        }
    }

    /**
     * 生成 policy 的 base64 字符串
     *
     * @author 王俊
     * @date 2018-08-01
     */
    getPolicyBase64() {
        let date = new Date();
        // 设置 policy 过期时间
        date.setHours(date.getHours() + this.timeOut);
        let srcT = date.toISOString();
        const policyText = {
            expiration: srcT,
            conditions: [
                // 限制上传大小
                ['content-length-range', 0, this.maxSize * 1024 * 1024]
            ]
        };
        const buffer = new Buffer(JSON.stringify(policyText));
        return buffer.toString('base64');
    }

    /**
     * 对协议进行签名
     *
     * @author 王俊
     * @date 2018-08-31
     *
     * @param policy 协议的 base64 字符串
     */
    signature(policy) {
        return crypto.createHmac('sha1', this.accessKeySecret).update(policy).digest().toString('base64');
    }
}

module.exports = MpUploadOssHelper;