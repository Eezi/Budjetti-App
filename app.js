
//Moduuli joka käsittelee bodget dataa
//ifie && module patern
//Lua data yksityisyyttä kun ei vaiukuta muuhun koodiin
//BUDGET CONTROLLER
var budgetController = (function() {
    //clousure systeemi pystyy käyttää arvoja funktion ulkopuolelta.
    //function constructor kun halutaan tehdä paljon objekteja.
    //Kun halutaan 
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.persentage = -1;
    };
    //Laskee prosentit menoista
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.persentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.persentage = -1;
        }
        
    };
    //Palauttaa sen jotta sitä voidaan käyttää
    Expense.prototype.getPercentage = function() {
        return this.persentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        //type päättää onko kyseessä exp vai inc
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
   
    var data = {
        //Objekti joka sisältää kaiken datan mitä käytetään
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        //-1 on sama kun sitä ei olisi olemassa.
        persentage: -1
    }
    //laitetaan metodin avulla nämä julkiseen käyttöön
    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //halutaan että ID = last ID + 1

            //luodaan uusi ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //tehdään uusi itemi riippuen onko 'inc' vai 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //valitaan all items objekti eli listat datasta
            //viedään se data structureen
            data.allItems[type].push(newItem)

            //return the new element
            return newItem;
            },

            deleteItem: function(type, id) {
                var ids, index;
               // id = 6
               //data.allItems[type][id];
               //ids = [1 2 4  8]
               //index = 3

              var ids = data.allItems[type].map(function(current){
                   return current.id;
                });
                //valitaan tämän hetkinen id
                index = ids.indexOf(id);
                //if index is different than -1
                if (index !== -1) {
                    //Poistaa yhden elementin
                    data.allItems[type].splice(index, 1);
                }

            },

        calculateBudget: function()  {
            
            //lasketaa total income ja expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //laskee budjetin: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //laskee prosentit incomesta mitä käytettiin
            if (data.totals.inc > 0) {
            data.persentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
            }else {
                data.persentage = -1;
            };
            //prosentin lasku: expense = 100 ja income 200, käytetty 50% = 100/200 = 0.5 * 100
        },

        calculateProcentages: function() {

            //Haetaan jokainen menoarvo ja tehdään tämä funktio jokaiselle
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {
            //jos meillä on vaikka 5 tuloa niin se kutsuu tuon function 5 kertaa
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            //
            return allPerc;
        },

        //palauttaa kaikki arvot jotta niitä voidaan käyttää
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                persentage: data.persentage
            };
        },
            
        testing: function() {
            console.log(data);
        }
        
    }

})();

var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
};

//Moduuli
// Kumpikaan Ifie ei vaikuta toisiinsa ollenkaan
//UI CONTROLLER
var UIController = (function() {
    //Metodi, koska sitä voidaan käyttää sitten muissa moduuleissa
    var DOMstrings = {
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
        dateLabel: '.budget__title--month'

    };
    //private function 
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        
        //Muutetaan numero absoluuttiseksi numeroksi
        num = Math.abs(num);
        //tekee luvusta 2 desimaalisen
        num = num.toFixed(2);
        //jakaa luvun pisteellä kahteen osaan
        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            //tekee tän vain osalle stringiä
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510 output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;

    };
    //Listataan prosentit sitä mukaan kun menoja syntyy
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        //Valitaan kaikki input kentät html osuudesta
        getInput: function() {
            return {
            type: document.querySelector(DOMstrings.inputType).value, //tulee olemaan inc tai exp
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
        };
    },

    addListItem: function(obj, type) {
        var html, newHtml, element;
        // Create html string with placeholer text

        if (type === 'inc') {
            element = DOMstrings.incomeContainer;

            html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>';

        } else if (type === 'exp') {
            element = DOMstrings.expensesContainer;

            html = '<div class="item clearfix" id="exp-%id"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"> </i></button></div></div></div>';
        }

        //vaihdetaan placeholder texti oikealla datalla
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
        
        //Insert the HTML into the DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


    },
    //Poistetaan elementti UI:sta
    deleteListItem: function(selectorID) {
        //Poistetaan child 
        var el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);
    },

    //Tehään uusi metodi
    clearFields: function() {
       var fields, fieldsArr;
        //Valitaan input kentät
       fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
        //Tehdään input kentistä lista valitsemalla ne Array.prototype.slice.call(fields)
       fieldsArr = Array.prototype.slice.call(fields);
        //Asetetaan kentät tyhjiksi kun arvot syötetään
       fieldsArr.forEach(function(current, index, array) {
            current.value = "";
       });
       //Vaihdetaan focus ensimmöiseen kenttään kun arvo on syötetty
       fieldsArr[0].focus();
    },

    //Päivitetään tulot ja menot päänäytölle
    displayBudget: function(obj) {
        var type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';

        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.persentage;
        //Lisätään prosenttilukuun % merkki ja jos prosentit on pienempi kun 0 niin '---'
        if (obj.persentage > 0) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.persentage +  '%';
        } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        }

    },

    displayPrecentages: function(perecentages) {

        var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

        

        nodeListForEach(fields, function(current, index) {
            if (perecentages[index] > 0) {
            //Lisätään prosentit ja % listaan
            current.textContent = perecentages[index] + '%';
            } else {
                current.textContent = '---';
            }        

        });

    },


    //Method
    displayMonth: function() {
        var now, months, year, month;
        now = new Date();

        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        month = now.getMonth();

        year = now.getFullYear();
        document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changedType: function() {

        var fields = document.querySelectorAll(
            DOMstrings.inputType + ',' +
            DOMstrings.inputDescription + ',' +
            DOMstrings.inputValue);

        nodeListForEach(fields, function(cur) {
            cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },


    //Päästetään se yleisen koodin käyttöön metodin avulla
    getDOMstring: function() {
        return DOMstrings
    }

 };


})();
//Moduuli
//Tämä ifie yhdistää kaikki toiminnot 
//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstring();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAdditem);

        //Hyväksyy napin myös jos painaa pelkkää enteriä.
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
            ctrlAdditem();
            }
        });
        //Valitaan DOMStringeistä container luokat ja lisätään eventlistener kun klikataan ctrlDeleteItem functiota.
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);  

        //Tehdään inputista ja valuen reunosta punaset kun lisätään menoja
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    
    
    var updateBudget = function() {
        //1. Laskee budjetin
        budgetController.calculateBudget();
        //2. Return the budget
        var budget = budgetController.getBudget();
        //3.Esittää budjetin UI:lle
        UICtrl.displayBudget(budget);
    }

    var updatePerecentage = function() {

        //1.calculate percentages
        budgetCtrl.calculateProcentages();
        //2.lukee prosentit budget controllerista
        //tallennetaan prosentit 
        var percentages = budgetCtrl.getPercentages();
        //3. Päivittää UI:n uusilla prosenteilla
        UICtrl.displayPrecentages(percentages);

    };

    //nimetään metodi DOMiksi jolloin sen saa käyttöön tässä moduulissa
    var ctrlAdditem = function() {
        var input, newItem;
        //1. Otetaan täytetty input data
        input = UICtrl.getInput();
        //ei toimi jos kentät on tyhjiä, tai value ei ole numero, tai jos se on 0 tai pienempi.
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. lisätään itemi budget controlleriin
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Lisätään itemi UI:hin
            UICtrl.addListItem(newItem, input.type);

             //4. Tyhjentää kentät
            UICtrl.clearFields();
        
            //5. Laskee ja päivittää budjetin
            updateBudget();

            //6. Laskee ja päivittää prosentit
            updatePerecentage();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        //Valitaan targetin elementti html osuudesta ja sen ID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //inc-1
            //valitaan kaikki myös datasta ja interfacesta 
            splitID = itemID.split('-');
            //jaetaan id:t kahteen osaan
            type = splitID[0];
            //tehdään ID:stä number koska se oli string
            ID = parseInt(splitID[1]);

            //1. poistaa itemin data structuresta
            budgetCtrl.deleteItem(type, ID);
            //2.Poistaa itemin UI:sta
            UICtrl.deleteListItem(itemID);
            //3. päivittää ja näyttää uuden budjetin
            updateBudget();

        }
    };

   return {
       init: function() {
           
           setupEventListeners();
           //Kun halutaan sivun avaamisessa kaikki luvut olevan 0 tai tyhjät
           UICtrl.displayMonth();
           UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            persentage: 0
           });
       }
   }
   

})(budgetController, UIController);

controller.init();













































