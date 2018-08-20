class PoA {
    /**
     * Allows to get file
     */
    getFile() {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const file = document.querySelector('input[type=file]').files[0];
            if (!file)
                throw new Error('You didn\'t add a file');
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                resolve(reader.result);
            };
        });
    }

    /**
     * Allows to hashing data via keccak256
     * @param data Any set of data
     * @return {*} Hash of data
     */
    getHash(data) {
        const web3 = new Web3();
        return web3.utils.keccak256(data);
    }

    /**
     * Allows to send any data to any url
     * @param data Any data
     * @param url Any server url
     * @return {Promise<*>} response
     */
    async sendData(data, url) {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": url,
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            },
            "data": JSON.stringify(data),
            "processData": false,
        };

        const result = await $.ajax(settings);
        return result;
    }
}

async function main() {
    const p = new PoA();
    try {
        const data = await p.getFile();
        document.getElementById('file-error').innerText = '';
        const hash = p.getHash(data);
        document.getElementById('data').innerHTML = `<p>File data</p><textarea rows="4" cols="50">${data}</textarea><p>Hash</p><p>${hash}</p>`
        // const response = await p.sendData(hash, 'url');
    } catch (e) {
        document.getElementById('file-error').innerText = e.message;
    }
}
