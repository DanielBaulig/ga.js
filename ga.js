/*jshint laxcomma: true */
(function (ns) {
  function rand(min, max) {
    if (!max) {
      max = min;
      min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  ns.GA = function(options) {
    this.settings = {
        mutate: function random(value) {
          return Math.random();
        }
      , recombine: ns.GA.strategies.recombine.crossover
      , select: ns.GA.strategies.select.piecake
      , fitness: function(chromosome) {
          return chromosome.reduce(function(s, v) {
            return s + v;
          }, 0);
        }
      , 'population size': 100
      , 'mutation rate': 0.03
      , 'loose rate': 0.0
      , 'duplication rate': 0.0
    };
    for (var option in options) {
      this.settings[option] = options[option];
    }
  };

  ns.GA.strategies = {
      recombine: {
        crossover: function(mother, father) {
          var n = rand(mother.length);
          return mother.slice(0, n).concat(father.slice(n));
        }
      }
    , select: {
      piecake: function piecake() {
        var pos = this.totalFitness * Math.random(), i = 0;
        while (pos > this.population[i].fitness) 
          pos -= this.population[i++].fitness;
        return this.population[i];
      }
    }
  };

  ns.GA.prototype.init = function() {
    this.population = [];
    for (var i = 0, l = this.settings['population size']; i < l; i++) {
      var c = [];
      for (var j = 0, k = this.settings['chromosome size']; j < k; i++) {
        c.push(this.settings.mutate.call(this));
      }
      this.population.push(c);
    }

    return this.calculateFitness();
  };

  ns.GA.prototype.averageFitness = function() {
    return this.totalFitness / this.population.length;
  };

  ns.GA.prototype.calculateFitness = function() {
    this.totalFitness = this.population.reduce(function(f, c) {
      return f + (c.fitness = this.settings.fitness(c));
    }, 0);
    return this;
  };

  ns.GA.prototype.generateGeneration = function() {
    var children = []
      , pop = this.population
      , select = this.settings.select
      , popsize = this.settings['population size']
      , recombine = this.settings.recombine
      , self = this
      , mutate = this.settings.mutate
      , mutationrate = this.settings['mutation rate']
      , looserate = this.settings['loose rate']
      , duplicationrate = this.settings['duplication rate'];


    function mutateMap(value) {
      return Math.random() < mutationrate ? mutate.call(self, value) : value;
    }
    function looseFilter() {
      return Math.random() > looserate;
    }
    function duplicationEach(value) {
      if (Math.random() < duplicationrate) {
        this.push(value);
      }
      this.push(value);
    }

    while (children.length < popsize) {
      var father = select.call(this);
      pop.splice(1, pop.indexOf(father));
      var mother = select.call(this);
      pop.splice(1, pop.indexOf(mother));
      var c = [];
      recombine.call(this, mother, father).map(mutateMap).filter(looseFilter).forEach(duplicationEach, c);

      children.push(c);
    }
    this.population = children;

    return this.calculateFitness();
  };
})(window);
