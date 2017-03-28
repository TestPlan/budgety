var model = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        items: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function (type) {
        var sum = 0;

        data.items[type].forEach(function (cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    };

    return {
        addItem: function (type, des, val) {
            var newItem, id;

            if (data.items[type].length === 0) {
                id = 0;
            } else {
                id = data.items[type][data.items[type].length - 1].id + 1;
            }

            if (type === 'exp') {
                newItem = new Expense(id, des, val);
            } else {
                newItem = new Income(id, des, val);
            }

            data.items[type].push(newItem);

            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.items[type].map(function (cur) {
                return cur.id;
            });

            index = data.items[type][ids.indexOf(id)];

            if (index !== -1) {
                data.items[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;

            if (data.budget <= 0) {
                data.percentage = -1;
            } else {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
        },

        calculatePercentages: function () {
            data.items.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPercs = data.items.exp.map(function (cur) {
                return cur.getPercentage();
            });

            return allPercs;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                expenses: data.totals.exp,
                income: data.totals.inc,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    }
})();


var view = (function () {

    var strings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--date'
    };

    var formatNumber = function (num, type) {
        num = Math.abs(num);
        num = '$' + Number(num.toFixed(2)).toLocaleString();

        return (type === 'exp' ? '-' : '+') + ' ' + num;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };


    return {
        getInput: function () {
            return {
                type: document.querySelector(strings.inputType).value, // will be inc or exp
                description: document.querySelector(strings.inputDescription).value,
                value: parseFloat(document.querySelector(strings.inputValue).value)
            }

        },

        addListItem: function (item, type) {
            // create HTML string with placeholder tags
            var element, html, newHtml;

            if (type === 'inc') {
                element = strings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete">' +
                    ' <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'

            } else {
                element = strings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> ' +
                    '<div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">' +
                    '21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline">' +
                    '</i></button> </div> </div> </div>'
            }

            // replace ph tags with actual data
            newHtml = html.replace('%id%', item.id);
            newHtml = newHtml.replace('%description%', item.description);
            newHtml = newHtml.replace('%value%', formatNumber(item.value, type));

            // insert html into dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function (id) {
            var el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields;
            fields = document.querySelectorAll(strings.inputDescription + ', ' + strings.inputValue);
            fields = Array.prototype.slice.call(fields);
            fields.forEach(function (cur) {
                cur.value = '';
            });
            fields[0].focus();
        },

        displayBudget: function (obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(strings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(strings.incomeLabel).textContent = formatNumber(obj.income, 'inc');
            document.querySelector(strings.expensesLabel).textContent = formatNumber(obj.expenses, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(strings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(strings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percens) {
            var fields = document.querySelectorAll(strings.expensesPercLabel);

            nodeListForEach(fields, function (el, index) {

                if (percens[index] > 0) {
                    el.textContent = percens[index] + '%';
                } else {
                    el.textContent = percens[index] = '---';
                }

            });

        },

        displayDate: function () {
            var now, year, month, formatter;

            now = new Date();
            formatter = new Intl.DateTimeFormat("en", {month: "long"});
            month = formatter.format(now);
            year = now.getFullYear();

            document.querySelector(strings.dateLabel).textContent = month + ' ' + year;
        },

        changedType: function () {

            var fields = document.querySelectorAll(
                strings.inputType + ',' +
                strings.inputDescription + ',' +
                strings.inputValue
            );

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(strings.inputBtn).classList.toggle('red');
        },

        getStrings: function () {
            return strings;
        }
    }
})();


var controller = (function (model, view) {

    var setupEventListeners = function () {

        var strings = view.getStrings();

        document.querySelector(strings.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(strings.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(strings.inputType).addEventListener('change', view.changedType);
    };

    var updateBudget = function () {

        // 1. calc budget
        model.calculateBudget();


        // 2. return the budget
        var budget = model.getBudget();

        // 3. display budget
        view.displayBudget(budget);
    };

    var updatePercentages = function () {

        var percentages;
        // calc perc
        model.calculatePercentages();

        // read perc from model
        percentages = model.getPercentages();

        // update UI
        view.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {

        var input, newItem;
        // 1. get input data
        input = view.getInput();

        if (input.description !== '' && typeof input.value === "number" && !isNaN(input.value) && input.value > 0) {
            // 2. add item to budget controller
            newItem = model.addItem(input.type, input.description, input.value);

            // 3. add item to UI
            view.addListItem(newItem, input.type);

            // 4. clear fields
            view.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calulate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (e) {
        var itemId, splitId, type, id;
        itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            model.deleteItem(type, id);
            model.calculateBudget();
            view.deleteListItem(itemId);
            updateBudget();
            updatePercentages();
        }
    };

    return {
        init: function () {
            view.displayDate();
            view.displayBudget({
                budget: 0,
                expenses: 0,
                income: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(model, view);

controller.init();
