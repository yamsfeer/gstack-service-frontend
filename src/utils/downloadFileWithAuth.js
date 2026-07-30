import Axios from 'axios';
import router from '@/router';
export function downloadFileWithAuth (downloadUrl, name) {
    var token = router.app.$store.getters['GET_TOKEN'];
    Axios({
        headers: {'Authorization': `Bearer ${token}`},
        method: 'get',
        url: downloadUrl,
        responseType: 'arraybuffer'
    })
    .then(function (response) {
        const blob = new Blob([response.data]);
        const URL = window.URL || window.webkitURL;
        let url = URL.createObjectURL(blob);
        const aLink = document.createElement('a');
        aLink.href = url;
        aLink.download = name; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效

        let event;
        if (window.MouseEvent) {
            event = new MouseEvent('click');
        } else {
            event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        }
        aLink.dispatchEvent(event);
    }).catch(function () {});
}
