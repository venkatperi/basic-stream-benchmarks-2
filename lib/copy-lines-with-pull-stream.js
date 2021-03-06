// Generated by CoffeeScript 1.12.1
(function() {
  var $split, $stringify, $utf8, CND, FS, O, PATH, STPS, async_map, badge, debug, echo, format_float, format_integer, help, info, mkdirp, new_numeral, pull, rpr, through, urge, warn, whisper;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'BASIC-STREAM-BENCHMARKS-2/COPY-LINES-WITH-PULL-STREAM';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  info = CND.get_logger('info', badge);

  urge = CND.get_logger('urge', badge);

  help = CND.get_logger('help', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  new_numeral = require('numeral');

  format_float = function(x) {
    return (new_numeral(x)).format('0,0.000');
  };

  format_integer = function(x) {
    return (new_numeral(x)).format('0,0');
  };

  PATH = require('path');

  FS = require('fs');

  mkdirp = require('mkdirp');

  O = require('./options');

  $split = require('pull-split');

  $stringify = require('pull-stringify');

  $utf8 = require('pull-utf8-decoder');

  pull = require('pull-stream');

  through = require('pull-through');

  async_map = require('pull-stream/throughs/async-map');

  STPS = require('stream-to-pull-stream');

  this.main = function(handler) {
    var $as_line, $as_text, $count, $filter_comments, $filter_empty, $input, $output, $pass, $select_fields, $split_fields, $trim, i, idx, input_stream, item_count, output_stream, pipeline, push, ref, t0, t1;
    mkdirp.sync(PATH.dirname(O.outputs.pullstream));
    input_stream = FS.createReadStream(O.inputs.ids);
    output_stream = FS.createWriteStream(O.outputs.pullstream);
    pipeline = [];
    push = pipeline.push.bind(pipeline);
    t0 = null;
    t1 = null;
    item_count = 0;
    input_stream.on('open', function() {
      return t0 = Date.now();
    });
    output_stream.on('close', function() {
      var dts, dts_txt, ips, ips_txt, item_count_txt;
      t1 = Date.now();
      dts = (t1 - t0) / 1000;
      dts_txt = format_float(dts);
      item_count_txt = format_integer(item_count);
      ips = item_count / dts;
      ips_txt = format_float(ips);
      help(PATH.basename(__filename));
      help("pass-through count: " + O.pass_through_count);
      help(item_count_txt + " items; dts: " + dts_txt + ", ips: " + ips_txt);
      return handler();
    });
    $count = function() {
      return pull.map(function(line) {
        item_count += +1;
        return line;
      });
    };
    $trim = function() {
      return pull.map(function(line) {
        return line.trim();
      });
    };
    $filter_empty = function() {
      return pull.filter(function(line) {
        return line.length > 0;
      });
    };
    $filter_comments = function() {
      return pull.filter(function(line) {
        return !line.startsWith('#');
      });
    };
    $split_fields = function() {
      return pull.map(function(line) {
        return line.split('\t');
      });
    };
    $select_fields = function() {
      return pull.map(function(fields) {
        var _, formula, glyph;
        _ = fields[0], glyph = fields[1], formula = fields[2];
        return [glyph, formula];
      });
    };
    $as_text = function() {
      return pull.map(function(fields) {
        return JSON.stringify(fields);
      });
    };
    $as_line = function() {
      return pull.map(function(line) {
        return line + '\n';
      });
    };
    if (O.pass_through_asynchronous) {
      $pass = function() {
        return async_map(function(data, handler) {
          return setImmediate(function() {
            return handler(null, data);
          });
        });
      };
    } else {
      $pass = function() {
        return pull.map(function(line) {
          return line;
        });
      };
    }
    $input = function() {
      return STPS.source(input_stream);
    };
    $output = function() {
      return STPS.sink(output_stream, function(error) {
        var dts;
        if (error != null) {
          throw error;
        }
        t1 = Date.now();
        return dts = (t1 - t0) / 1000;
      });
    };
    push($input());
    push($utf8());
    push($split());
    push($count());
    push($trim());
    push($filter_empty());
    push($filter_comments());
    push($split_fields());
    push($select_fields());
    push($as_text());
    push($as_line());
    for (idx = i = 1, ref = O.pass_through_count; i <= ref; idx = i += +1) {
      push($pass());
    }
    push($output());
    return pull.apply(null, pipeline);
  };

}).call(this);

//# sourceMappingURL=copy-lines-with-pull-stream.js.map
