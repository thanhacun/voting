/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Vote = require('../api/vote/vote.model');

Thing.find({}).remove(function() {
  Thing.create({
    name : 'Development Tools',
    info : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.'
  }, {
    name : 'Server and Client integration',
    info : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.'
  }, {
    name : 'Smart Build System',
    info : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html'
  },  {
    name : 'Modular Structure',
    info : 'Best practice client and server structures allow for more code reusability and maximum scalability'
  },  {
    name : 'Optimized Build',
    info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
  },{
    name : 'Deployment Ready',
    info : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
  });
});

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {
      console.log('finished populating users');
      User.findOne({email: 'test@test.com'}, function(err, test_user) {
        Vote.find({}).remove(function() {
          Vote.create({
            name: 'How good is FreeCodeCamp',
            options: [
              {name: 'Good'},
              {name: 'So so'},
              {name: 'Poor'}
            ],
            user: test_user._id
          }, {
            name: 'Which color do you like',
            options: [
              {name: 'Black'},
              {name: 'White'},
              {name: 'Yellow'},
              {name: 'Blue'}
            ],
            user: test_user._id
          }, function() {
            //just test populate result
            Vote.findOne({}).populate('user', 'name email').exec(function(err, vote) {
              if (err) console.error(err);
              //console.log(vote.user);
              console.log(vote.user.name, vote.user.email);
            });
          })
        });
      });
    }
  );
});




