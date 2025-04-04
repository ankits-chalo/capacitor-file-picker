'use strict';

var core = require('@capacitor/core');

class FilePickerWeb extends core.WebPlugin {
    constructor() {
        super(...arguments);
        this.ERROR_PICK_FILE_CANCELED = 'pickFiles canceled.';
    }
    async checkPermissions() {
        throw this.unimplemented('Not implemented on web.');
    }
    async convertHeicToJpeg(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async pickFiles(options) {
        const pickedFiles = await this.openFilePicker(options);
        if (!pickedFiles) {
            throw new Error(this.ERROR_PICK_FILE_CANCELED);
        }
        const result = {
            files: [],
        };
        for (const pickedFile of pickedFiles) {
            const file = {
                blob: pickedFile,
                modifiedAt: pickedFile.lastModified,
                mimeType: this.getMimeTypeFromUrl(pickedFile),
                name: this.getNameFromUrl(pickedFile),
                path: undefined,
                size: this.getSizeFromUrl(pickedFile),
            };
            if (options === null || options === undefined ? undefined : options.readData) {
                file.data = await this.getDataFromFile(pickedFile);
            }
            result.files.push(file);
        }
        return result;
    }
    async pickDirectory() {
        throw this.unimplemented('Not implemented on web.');
    }
    async pickImages(options) {
        return this.pickFiles(Object.assign({ types: ['image/*'] }, options));
    }
    async pickMedia(options) {
        return this.pickFiles(Object.assign({ types: ['image/*', 'video/*'] }, options));
    }
    async pickVideos(options) {
        return this.pickFiles(Object.assign({ types: ['video/*'] }, options));
    }
    async requestPermissions(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async openFilePicker(options) {
        var _a;
        const accept = ((_a = options === null || options === undefined ? undefined : options.types) === null || _a === undefined ? undefined : _a.join(',')) || '';
        const limit = (options === null || options === undefined ? undefined : options.limit) === undefined ? 0 : options.limit;
        return new Promise(resolve => {
            let onChangeFired = false;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.multiple = limit === 0;
            input.addEventListener('change', () => {
                onChangeFired = true;
                const files = Array.from(input.files || []);
                resolve(files);
            }, { once: true });
            // Workaround to detect when Cancel is selected in the File Selection dialog box.
            window.addEventListener('focus', async () => {
                await this.wait(1000);
                if (onChangeFired) {
                    return;
                }
                resolve(undefined);
            }, { once: true });
            input.click();
        });
    }
    async getDataFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = typeof reader.result === 'string' ? reader.result : '';
                const splittedResult = result.split('base64,');
                const base64 = splittedResult[1] || '';
                resolve(base64);
            };
            reader.onerror = error => {
                reject(error);
            };
        });
    }
    getNameFromUrl(file) {
        return file.name;
    }
    getMimeTypeFromUrl(file) {
        return file.type;
    }
    getSizeFromUrl(file) {
        return file.size;
    }
    async wait(delayMs) {
        return new Promise(resolve => setTimeout(resolve, delayMs));
    }
}

const FilePicker = core.registerPlugin('FilePicker', {
    web: () => new FilePickerWeb(),
});

exports.FilePicker = FilePicker;
//# sourceMappingURL=plugin.cjs.js.map
