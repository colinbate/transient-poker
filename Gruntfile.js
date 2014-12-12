/* global module:false */
module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner:
        '/*!\n' +
        ' * Transient Poker <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd, HH:MM") %>)\n' +
        ' * http://bitbucket.org/colinbate/transient-poker\n' +
        ' * MIT licensed\n' +
        ' *\n' +
        ' * Copyright (C) 2015 Colin Bate, http://colinbate.com\n' +
        ' */\n'
    },
    jshint: {
      options: {
        bitwise: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        nonew: true,
        plusplus: true,
        quotmark: true,
        sub: true,
        strict: true,
        undef: true,
        unused: true,
        trailing: true,
        eqnull: true,
        browser: true,
        expr: true,
        globals: {
          define: false,
          require: false,
          module: false
        }
      },
      product: ['*.js', 'src/*.js', 'src/modules/**/*.js']
    },
    less: {
      dev: {
        options: {
          sourceMap: true,
        },
        files: {
          'src/poker.css': 'src/less/poker.less'
        }
      },
      clean: {
        files: {
          'src/poker.css': 'src/less/poker.less'
        }
      }
    },
    replace: {
      version: {
        src: ['src/index.html'],
        dest: 'src/index.html',             // destination directory or file
        replacements: [{
          from: /v\d+\.\d+\.\d+(-[a-z0-9]+)?/,                   // string replacement
          to: 'v<%= pkg.version %>'
        }]
      }
    },
    watch: {
      less: {
        files: ['src/less/**/*.less'],
        tasks: 'less:dev'
      },
      js: {
        files: ['*.js', 'src/*.js', 'src/modules/**/*.js'],
        tasks: 'jshint:product'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('default', ['jshint', 'less:dev']);

};
