/** Менеджер шорткатов */

var Shortcuts = {

    /** Специальные клавиши */
    special: {'backspace': 8, 'tab': 9, 'enter': 13, 'pause': 19, 'capslock': 20, 'esc': 27, 'space': 32, 'pageup': 33, 'pagedown': 34, 'end': 35, 'home': 36, 'left': 37, 'up': 38, 'right': 39, 'down': 40, 'insert': 45, 'delete': 46, 'f1': 112, 'f2': 113, 'f3': 114, 'f4': 115, 'f5': 116, 'f6': 117, 'f7': 118, 'f8': 119, 'f9': 120, 'f10': 121, 'f11': 122, 'f12': 123, '?': 191},

    /** Хеш со списками шорткатов */
    lists: {},

    /** В этом хеше запоминаем какие клавиши нажаты в данный момент. Ключ - ASCII-код клавиши (e.which), значение - true/false. */
    pressed: {},

    init: function() {
        var that = this;

        $(document).bind($.browser.opera ? 'keypress' : 'keydown', function(e) {
            if (!that.pressed[e.which]) {
                that.runShortcuts('down', e);
            }
            that.pressed[e.which] = true;
            that.runShortcuts('hold', e);
        });

        $(document).bind('keyup', function(e) {
            that.pressed[e.which] = false;
            that.runShortcuts('up', e);
        });
    },

    /**
     * Добавить шорткат
     * @param {Object} params Параметры шортката.
     * @param {String} params.type Тип события по которому будет срабатывать обработчик.
     *     Возможные значения:
     *     down – На нажатие клавиши (сочетания клавиш).
     *     hold – На нажатие и удержание клавиши. Обработчик будет вызываться сразу после нажатия и с некоторой периодичностью пока нажата клавиша.
     *     up   – На отпускание клавиши.
     * @param {String} params.mask Строка задающая сочетание клавиш.
     *     Примеры: 'down', 'esc', 'shift+up', 'ctrl+a'.
     *     Строка состоит из имен клавиш разделенных плюсами.
     *     Может быть не более одной клавиши отличной от Ctrl, Shift или Alt.
     *     Строка нечувствительна к регистру.
     * @param {Boolean} [params.enableInInput] Разрешить выполнение шортката внутри полей ввода. По умолчанию запрещено.
     * @param {Function} params.handler Обработчик события.
     * @param {String}  [params.list] В какой список добавить шорткат. По умолчанию шорткат заносится в список 'default'.
     */
    add: function(params) {
        if (!params.list) {
            params.list = 'default';
        }

        var shortcut = new Shortcuts.Shortcut(params);
        var list = this.lists[params.list];

        if (!list) {
            list = new Shortcuts.List();
            this.lists[params.list] = list;
        }

        list.add(shortcut);

        if (!this.activeList) { // Если еще нет активного списка, активируем текущий
            this.setList(params.list);
        }
    },

    setList: function(name) {
        this.activeList = this.lists[name];
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

    runShortcuts: function(type, e) {
        if (!this.activeList) { return; }

        var maskObj = {
            ctrl: e.ctrlKey,
            alt: e.altKey,
            shift: e.shiftKey,
            which: e.which
        };

        var isInput = this.isInput(e.target);
        var key = this.getKey(type, maskObj);    // Получаем по типу события и маске ключ
        var shortcuts = this.activeList.getShortcuts(key); // Получаем по ключу шорткаты

        if (shortcuts && shortcuts.length > 0) {
            e.preventDefault();
            for (var i = 0, len = shortcuts.length; i < len; i += 1) {
                // Если не в инпуте или для данного шортката разрешено выполнение в инпутах
                if (!isInput || shortcuts[i].isEnableInInput()) {
                    shortcuts[i].run(); // Выполняем шорткат
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

Shortcuts.init();

/* ------------------------------------------------------------------------------------------------------------- */

Shortcuts.Shortcut = function(params) {
    this.params = params;
};

Shortcuts.Shortcut.prototype = {

    getKey: function() {
        return Shortcuts.getKey(this.params.type, this.getMaskObject());
    },

    getMaskObject: function() {
        var obj = {};
        var items = this.params.mask.toLowerCase().replace(/\s+/g, '').split(/\+/);
        var item;

        for (var i = 0, len = items.length; i < len; i += 1) {
            item = items[i];

            if (item === 'ctrl' || item === 'alt' || item === 'shift') {
                obj[item] = true;
            } else {
                obj.which = Shortcuts.special[item] || item.toUpperCase().charCodeAt();
            }
        }

        return obj;
    },

    isEnableInInput: function() {
        return this.params.enableInInput;
    },

    run: function() {
        this.params.handler();
    }
};

/* ------------------------------------------------------------------------------------------------------------- */

/** Список шорткатов */

Shortcuts.List = function() {
    this.shortcuts = {};
};

Shortcuts.List.prototype = {

    add: function(shortcut) {
        var key = shortcut.getKey();

        if (!this.shortcuts[key]) {
            this.shortcuts[key] = [];
        }

        this.shortcuts[key].push(shortcut);
    },

    getShortcuts: function(key) {
        return key ? this.shortcuts[key] : this.shortcuts;
    }
};