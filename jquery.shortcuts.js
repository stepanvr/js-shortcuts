/**
 * JavaScript Shortcuts Library (jQuery plugin) v0.3
 * http://www.stepanreznikov.com/js-shortcuts/
 * Copyright (c) 2010 Stepan Reznikov (stepan.reznikov@gmail.com)
 * Date: 2010-01-30
 */

/*global jQuery */

(function($) {

$.Shortcuts = {

    /** Специальные клавиши */
    special: {'backspace': 8, 'tab': 9, 'enter': 13, 'pause': 19, 'capslock': 20, 'esc': 27, 'space': 32, 'pageup': 33, 'pagedown': 34, 'end': 35, 'home': 36, 'left': 37, 'up': 38, 'right': 39, 'down': 40, 'insert': 45, 'delete': 46, 'f1': 112, 'f2': 113, 'f3': 114, 'f4': 115, 'f5': 116, 'f6': 117, 'f7': 118, 'f8': 119, 'f9': 120, 'f10': 121, 'f11': 122, 'f12': 123, '?': 191},

    /** Хеш со списками шорткатов */
    lists: {},

    /** В этом хеше запоминаем какие клавиши нажаты в данный момент. Ключ - ASCII-код клавиши (e.which), значение - true/false. */
    pressed: {},

    /** Начать реагировать на шорткаты. Навешиваем обработчики событий. */
    start: function() {
        var that = this;

        $(document).bind($.browser.opera ? 'keypress' : 'keydown', function(e) {
            if (!that.pressed[e.which]) {
                that.run('down', e);
            }
            that.pressed[e.which] = true;
            that.run('hold', e);
        });

        $(document).bind('keyup', function(e) {
            that.pressed[e.which] = false;
            that.run('up', e);
        });
    },

    /**
     * Добавить шорткат.
     * @param {Object}   params Параметры шортката.
     * @param {String}  [params.type] Тип события по которому будет срабатывать обработчик.
     *     Возможные значения:
     *     down – На нажатие клавиши (сочетания клавиш). Значение по умолчанию.
     *     up   – На отпускание клавиши.
     *     hold – На нажатие и удержание клавиши. Обработчик будет вызван сразу после нажатия
     *            и потом будет вызываться с некоторой периодичностью пока нажата клавиша.
     * 
     * @param {String}   params.mask Строка задающая сочетание клавиш.
     *     Примеры: 'Down', 'Esc', 'Shift+Up', 'ctrl+a'.
     *     Строка состоит из имен клавиш разделенных плюсами.
     *     Может быть не более одной клавиши отличной от Ctrl, Shift или Alt.
     *     Строка нечувствительна к регистру.
     * 
     * @param {Boolean} [params.enableInInput] Разрешить выполнение шортката внутри полей ввода. По умолчанию запрещено.
     * @param {Function} params.handler Обработчик события. В качестве первого параметра будет передан event object.
     * @param {String}  [params.list] В какой список добавить шорткат. По умолчанию шорткат заносится в список default.
     */
    add: function(params) {
        if (!params.mask) { throw new Error("$.Shortcuts.add: required parameter 'params.mask' is undefined."); }
        if (!params.handler) { throw new Error("$.Shortcuts.add: required parameter 'params.handler' is undefined."); }
        if (!params.type) { params.type = 'down'; }
        if (!params.list) { params.list = 'default'; }

        var maskObj = this.getMaskObject(params.mask);
        var key = this.getKey(params.type, maskObj);

        if (!this.lists[params.list]) {
            this.lists[params.list] = {};
        }

        var list = this.lists[params.list];

        if (!list[key]) {
            list[key] = [];
        }

        list[key].push(params);

        if (!this.active) { // Если еще нет активного списка, то активируем текущий
            this.setList(params.list);
        }
    },

    /**
     * Удалить шорткат.
     * @param {Object}  params       Параметры.
     * @param {String} [params.type] Тип события (down|up|hold). По умолчанию down.
     * @param {String}  params.mask  Строка задающая сочетание клавиш.
     * @param {String} [params.list] Из какого списка удалить шорткат. По умолчанию default.
     */
    remove: function(params) {
        if (!params.mask) { throw new Error("$.Shortcuts.remove: required parameter 'params.mask' is undefined."); }
        if (!params.type) { params.type = 'down'; }
        if (!params.list) { params.list = 'default'; }

        if (this.lists[params.list]) {
            var maskObj = this.getMaskObject(params.mask);
            var key = this.getKey(params.type, maskObj);
            delete this.lists[params.list][key];
        }
    },

    /**
     * Установить список шорткатов активным.
     * @param {String} name Название списка.
     */
    setList: function(name) {
        this.active = this.lists[name];
    },

    getKey: function(type, maskObj) {
        var key = '';

        key += type;

        if (maskObj.ctrl) { key += '_ctrl'; }
        if (maskObj.alt) { key += '_alt'; }
        if (maskObj.shift) { key += '_shift'; }

        if (maskObj.which && maskObj.which !== 16 && maskObj.which !== 17 && maskObj.which !== 18){
            key += '_' + maskObj.which;
        }

        return key;
    },

    getMaskObject: function(mask) {
        var obj = {};
        var items = mask.toLowerCase().replace(/\s+/g, '').split(/\+/);
        var item;

        for (var i = 0, len = items.length; i < len; i += 1) {
            item = items[i];

            if (item === 'ctrl' || item === 'alt' || item === 'shift') {
                obj[item] = true;
            } else {
                obj.which = this.special[item] || item.toUpperCase().charCodeAt();
            }
        }

        return obj;
    },

    run: function(type, e) {
        if (!this.active) { return; }

        var maskObj = {
            ctrl: e.ctrlKey,
            alt: e.altKey,
            shift: e.shiftKey,
            which: e.which
        };

        if (e.type === 'keypress' && e.which >= 97 && e.which <= 122) {
            maskObj.which = e.which - 32;
        }

        var isInput = this.isInput(e.target);
        var key = this.getKey(type, maskObj); // Получаем по типу события и маске ключ
        var shortcuts = this.active[key]; // Получаем по ключу шорткаты
        var isPrevented = false;

        if (shortcuts && shortcuts.length > 0) {
            for (var i = 0, len = shortcuts.length; i < len; i += 1) {
                // Если не в инпуте или для данного шортката разрешено выполнение в инпутах
                if (!isInput || shortcuts[i].enableInInput) {
                    if (!isPrevented) {
                        e.preventDefault();
                        isPrevented = true;
                    }
                    shortcuts[i].handler(e); // Выполняем шорткат
                }
            }
        }
    },

    isInput: function(target) {
        var name = target.tagName.toLowerCase();
        var type = target.type;

        if ((name === 'input' && (type === 'text' || type === 'password' || type === 'file' || type === 'search')) || name === 'textarea') {
            return true;
        } else {
            return false;
        }
    }
};

}(jQuery));