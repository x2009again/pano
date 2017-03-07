/**
 * Created by ck on 2016/6/15.
 */

(function (window, document, $, undefined) {
    /**
     * 请求是否来自PC
     * @returns {boolean}
     */
    window.fromPC = function () {
        var result = true;
        (function (a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) result = false;
        })(navigator.userAgent || navigator.vendor || window.opera);
        return result;
    };

    /**
     * 获取地址栏参数
     * @param name
     * @returns {*}
     */
    window.getParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substring(1).match(reg);
        return r ? decodeURI(r[2]) : null;
    };

    /**
     * 获取最终样式
     * @param obj
     * @param attr
     * @returns {*}
     */
    window.getStyle = function (obj, attr) {
        return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
    };

    /**
     * 事件穿透
     * @param ele
     */
    window.noPointerEvents = function (ele) {
        ele.onclick = ele.onmouseover = function (e) {
            this.style.display = 'none';
            var x = e.pageX, y = e.pageY,
                under = document.elementFromPoint(x, y);
            this.style.display = '';
            e.stopPropagation();
            e.preventDefault();
            $(under).trigger(e.type);
        };
    };

    /**
     * 对象属性数量
     * @param obj
     * @returns {number}
     */
    window.propLength = function (obj) {
        var i = 0;
        for (var o in obj) obj.hasOwnProperty(o) && i++;
        return i;
    };

    /**
     * 克隆对象
     * @param obj
     * @returns {*}
     */
    window.deepClone = function (obj) {
        var o;
        if (typeof obj == "object") {
            if (obj === null) {
                o = null;
            } else {
                if (obj instanceof Array) {
                    o = [];
                    for (var i = 0, len = obj.length; i < len; i++) {
                        o.push(deepClone(obj[i]));
                    }
                } else {
                    o = {};
                    for (var j in obj) {
                        o[j] = deepClone(obj[j]);
                    }
                }
            }
        } else {
            o = obj;
        }
        return o;
    };

    var $alertDialog = $('.dialog.alert');
    var $mask = $('#mask');
    $.alert = function (info) {
        var defaults = {title: '警告', message: '操作提示！'};
        info = $.extend({}, defaults, info);
        $alertDialog.find('.title').html(info.title);
        $alertDialog.find('.body').html(info.message);
        $mask.show();
        $alertDialog.fadeIn();
    };
    $.alert.close = function () {
        $mask.hide();
        $alertDialog.fadeOut();
    };

    window.Progress = function (ele) {
        var container = ele ? $(ele) : $(document.body);
        var $progress = container.children('#_progress');
        var $num = null;
        if ($progress.length == 0) {
            $progress = $('<div id="_progress" </div>');
            $progress.html(
                '<div><div></div><div></div><div></div><div></div></div>' +
                '<div><div></div><div></div><div></div><div></div></div>');
            $num = $('<div></div>');
            $num.css({
                'line-height': '40px',
                'font-size': '14px',
                'text-align': 'center',
                'color': '#fff',
                'text-shadow': '0px 0px 5px #000'
            });
            $progress.append($num);
            container.append($progress);
        }
        this.start = function () {
            $progress.addClass('show');
            $num.html('');
            return this;
        };
        this.update = function (num) {
            $num.html(num + '%');
            return this;
        };
        this.end = function () {
            $progress.removeClass('show');
            return this;
        };
        return this;
    };

    window.MaskLayer = function (ele) {
        var container = ele ? $(ele) : $(document.body);
        var $mask = container.children('#_mask-layer');
        if ($mask.length == 0) {
            $mask = $('<div id="_mask-layer" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:9;background-color:rgba(0,0,0,0.2);display:none;"></div>');
            container.append($mask);
        }
        this.show = function (time) {
            if (time) $mask.fadeIn(time);
            else $mask.show();
            return this;
        };
        this.hide = function (time) {
            if (time) $mask.fadeOut(time);
            else $mask.hide();
            return this;
        };
        return this;
    };

    /**
     * 是否包含另一数组或元素
     * @returns {Boolean}
     */
    Array.prototype.contains = function (target) {
        if (Object.prototype.toString.call(target) === '[object Array]') {
            var notFoundCount = target.length;
            for (var i = 0; i < target.length; i++) {
                if (this.indexOf(target[i]) != -1) notFoundCount--;
            }
            return notFoundCount == 0;
        } else {
            return this.indexOf(target) != -1;
        }
    };

    /**
     * 数组去重
     * @returns {Array}
     */
    Array.prototype.unique = function () {
        var res = [];
        var json = {};
        for (var i = 0; i < this.length; i++) {
            if (!json[this[i]]) {
                res.push(this[i]);
                json[this[i]] = 1;
            }
        }
        return res;
    };

})(window, document, $);
