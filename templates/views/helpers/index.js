var moment = require('moment');
var _ = require('underscore');
var hbs = require('handlebars');
var keystone = require('keystone');
var cloudinary = require('cloudinary');
var i18n = require("i18n");
var fx = require('money');
var accounting = require('accounting');
// Declare Constants
var CLOUDINARY_HOST = 'https://res.cloudinary.com';

// Collection of templates to interpolate
var linkTemplate = _.template('<a href="<%= url %>"><%= text %></a>');
var scriptTemplate = _.template('<script src="<%= src %>"></script>');
var cssLinkTemplate = _.template('<link href="<%= href %>" rel="stylesheet">');
var cloudinaryUrlLimit = _.template(CLOUDINARY_HOST + '/<%= cloudinaryUser %>/image/upload/c_limit,f_auto,h_<%= height %>,w_<%= width %>/<%= publicId %>.jpg');

module.exports = function() {

	var _helpers = {};

	/**
	 * Generic HBS Helpers
	 * ===================
	 */

	// standard hbs equality check, pass in two values from template
	// {{#ifeq keyToCheck data.myKey}} [requires an else blockin template regardless]
	_helpers.ifeq = function(a, b, options) {
		if (a == b) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	};

	/**
	 * Port of Ghost helpers to support cross-theming
	 * ==============================================
	 *
	 * Also used in the default keystonejs-hbs theme
	 */

	// ### Date Helper
	// A port of the Ghost Date formatter similar to the keystonejs - jade interface
	//
	//
	// *Usage example:*
	// `{{date format='MM YYYY}}`
	// `{{date publishedDate format='MM YYYY'`
	//
	// Returns a string formatted date
	// By default if no date passed into helper than then a current-timestamp is used
	//
	// Options is the formatting and context check this.publishedDate
	// If it exists then it is formated, otherwise current timestamp returned

	_helpers.date = function(context, options) {
		if (!options && context.hasOwnProperty('hash')) {
			options = context;
			context = undefined;

			if (this.publishedDate) {
				context = this.publishedDate;
			}
		}

		// ensure that context is undefined, not null, as that can cause errors
		context = context === null ? undefined : context;

		var f = options.hash.format || 'MMM Do, YYYY',
			timeago = options.hash.timeago,
			date;

		// if context is undefined and given to moment then current timestamp is given
		// nice if you just want the current year to define in a tmpl
		if (timeago) {
			date = moment(context).fromNow();
		} else {
			date = moment(context).format(f);
		}
		return date;
	};

	// ### Category Helper
	// Ghost uses Tags and Keystone uses Categories
	// Supports same interface, just different name/semantics
	//
	// *Usage example:*
	// `{{categoryList categories separator=' - ' prefix='Filed under '}}`
	//
	// Returns an html-string of the categories on the post.
	// By default, categories are separated by commas.
	// input. categories:['tech', 'js']
	// output. 'Filed Undder <a href="blog/tech">tech</a>, <a href="blog/js">js</a>'

	_helpers.categoryList = function(categories, options) {
		var autolink = _.isString(options.hash.autolink) && options.hash.autolink === "false" ? false : true,
			separator = _.isString(options.hash.separator) ? options.hash.separator : ', ',
			prefix = _.isString(options.hash.prefix) ? options.hash.prefix : '',
			suffix = _.isString(options.hash.suffix) ? options.hash.suffix : '',
			output = '';

		function createTagList(tags) {
			var tagNames = _.pluck(tags, 'name');

			if (autolink) {
				return _.map(tags, function(tag) {
					return linkTemplate({
						url: ('/blog/' + tag.key),
						text: _.escape(tag.name)
					});
				}).join(separator);
			}
			return _.escape(tagNames.join(separator));
		}

		if (categories && categories.length) {
			output = prefix + createTagList(categories) + suffix;
		}
		return new hbs.SafeString(output);
	};

	/* To Implement [Ghost Helpers](http://docs.ghost.org/themes/#helpers)
	 * The [source](https://github.com/TryGhost/Ghost/blob/master/core/server/helpers/index.js)
	 *
	 * * `Foreach` Extended Helper
	 * * `Asset` Helper
	 * * `Content` Helper
	 * * `Excerpt` Helper
	 * * `Has` Helper
	 * * `Encode` Helper
	 * * Pagination
	 * * BodyClass
	 * * PostClass
	 * * meta_title
	 * * meta_description
	 * * ghost_[footer/header]
	 *
	 */

	/**
	 * KeystoneJS specific helpers
	 * ===========================
	 */

	// block rendering for keystone admin css
	_helpers.isAdminEditorCSS = function(user, options) {
		var output = '';
		if (typeof(user) !== 'undefined' && user.isAdmin) {
			output = cssLinkTemplate({
				href: "/keystone/styles/content/editor.min.css"
			});
		}
		return new hbs.SafeString(output);
	};

	// block rendering for keystone admin js
	_helpers.isAdminEditorJS = function(user, options) {
		var output = '';
		if (typeof(user) !== 'undefined' && user.isAdmin) {
			output = scriptTemplate({
				src: '/keystone/js/content/editor.js'
			});
		}
		return new hbs.SafeString(output);
	};

	// Used to generate the link for the admin edit post button
	_helpers.adminEditableUrl = function(user, options) {
		var rtn = keystone.app.locals.editable(user, {
			'list': 'Post',
			'id': options
		});
		return rtn;
	};

	// ### CloudinaryUrl Helper
	// Direct support of the cloudinary.url method from Handlebars (see
	// cloudinary package documentation for more details).
	//
	// *Usage examples:*
	// `{{{cloudinaryUrl image width=640 height=480 crop='fill' gravity='north'}}}`
	// `{{#each images}} {{cloudinaryUrl width=640 height=480}} {{/each}}`
	//
	// Returns an src-string for a cloudinary image

	_helpers.cloudinaryUrl = function(context, options) {

		// if we dont pass in a context and just kwargs
		// then `this` refers to our default scope block and kwargs
		// are stored in context.hash

		if (!options && context.hasOwnProperty('hash')) {
			// strategy is to place context kwargs into options
			options = context;
			// bind our default inherited scope into context
			context = this;
		}

		// safe guard to ensure context is never null
		context = context === null ? undefined : context;

		if ((context) && (context.public_id)) {
			var imageName = context.public_id.concat('.',context.format);

			return cloudinary.url(imageName, options.hash);
		}
		else {
			return null;
		}
	};

	// ### Content Url Helpers
	// KeystoneJS url handling so that the routes are in one place for easier
	// editing.  Should look at Django/Ghost which has an object layer to access
	// the routes by keynames to reduce the maintenance of changing urls

	// Direct url link to a specific post
	_helpers.postUrl = function(postSlug, options) {
		return ('/blog/post/' + postSlug);
	};

	// might be a ghost helper
	// used for pagination urls on blog
	_helpers.pageUrl = function(pageNumber, options) {
		return '?page=' + pageNumber;
	};

	// create the category url for a blog-category page
	_helpers.categoryUrl = function(categorySlug, options) {
		return ('/blog/' + categorySlug);
	};

	// ### Pagination Helpers
	// These are helpers used in rendering a pagination system for content
	// Mostly generalized and with a small adjust to `_helper.pageUrl` could be universal for content types

	/*
	* expecting the data.posts context or an object literal that has `previous` and `next` properties
	* ifBlock helpers in hbs - http://stackoverflow.com/questions/8554517/handlerbars-js-using-an-helper-function-in-a-if-statement
	* */
	_helpers.ifHasPagination = function(postContext, options){
		// if implementor fails to scope properly or has an empty data set
		// better to display else block than throw an exception for undefined
		if(_.isUndefined(postContext)){
			return options.inverse(this);
		}
		if(postContext.next || postContext.previous){
			return options.fn(this);
		}
		return options.inverse(this);
	};

	_helpers.paginationNavigation = function(pages, currentPage, totalPages, options){
		var html = '';

		// pages should be an array ex.  [1,2,3,4,5,6,7,8,9,10, '....']
		// '...' will be added by keystone if the pages exceed 10
		_.each(pages, function(page, ctr){
			// create ref to page, so that '...' is displayed as text even though int value is required
			var pageText = page,
			// create boolean flag state if currentPage
			isActivePage = ((page === currentPage)? true:false),
			// need an active class indicator
			liClass = ((isActivePage)? ' class="active"':'');
			liId = ' id="pagination"'

			// if '...' is sent from keystone then we need to override the url
			if(page === '...'){
				// check position of '...' if 0 then return page 1, otherwise use totalPages
				page = ((ctr)? totalPages:1);
			}

			// get the pageUrl using the integer value
			var pageUrl = _helpers.pageUrl(page);

			// wrapup the html
			html += '<li'+liClass + ''+liId+'>'+ linkTemplate({url:pageUrl,text:pageText})+'</li>\n';
		});
		return html;
	};

        // special helper to ensure that we always have a valid page url set even if
        // the link is disabled, will default to page 1
        _helpers.paginationPreviousUrl = function(previousPage, totalPages){
            if(previousPage === false){
                previousPage = 1;
            }
            return _helpers.pageUrl(previousPage);
        };

        // special helper to ensure that we always have a valid next page url set
        // even if the link is disabled, will default to totalPages
        _helpers.paginationNextUrl = function(nextPage, totalPages){
            if(nextPage === false){
                nextPage = totalPages;
            }
            return _helpers.pageUrl(nextPage);
        };


	//  ### Flash Message Helper
	//  KeystoneJS supports a message interface for information/errors to be passed from server
	//  to the front-end client and rendered in a html-block.  FlashMessage mirrors the Jade Mixin
	//  for creating the message.  But part of the logic is in the default.layout.  Decision was to
	//  surface more of the interface in the client html rather than abstracting behind a helper.
	//
	//  @messages:[]
	//
	//  *Usage example:*
	//  `{{#if messages.warning}}
	//      <div class="alert alert-warning">
	//          {{{flashMessages messages.warning}}}
	//      </div>
	//   {{/if}}`

	_helpers.flashMessages = function(messages) {
		var output = '';
		for (var i = 0; i < messages.length; i++) {

			if (messages[i].title) {
				output += '<h4>' + messages[i].title + '</h4>';
			}

			if (messages[i].detail) {
				output += '<p>' + messages[i].detail + '</p>';
			}

			if (messages[i].list) {
				output += '<ul>';
				for (var ctr = 0; ctr < messages[i].list.length; ctr++) {
					output += '<li>' + messages[i].list[ctr] + '</li>';
				}
				output += '</ul>';
			}
		}
		return new hbs.SafeString(output);
	};

	_helpers.each_upto = function(ary, max, options) {
	    if(!ary || ary.length == 0)
	        return options.inverse(this);

	    var result = [ ];
	    for(var i = 0; i < max && i < ary.length; ++i)
	        result.push(options.fn(ary[i]));
	    return result.join('');
	};

	_helpers.for =  function(from, to, incr, block) {
	    var accum = '';
	    for(var i = from; i <= to; i += incr)
	        accum += block.fn(i);
	    return accum;
	};


	//  ### underscoreMethod call + format helper
	//	Calls to the passed in underscore method of the object (Keystone Model)
	//	and returns the result of format()
	//
	//  @obj: The Keystone Model on which to call the underscore method
	//	@undescoremethod: string - name of underscore method to call
	//
	//  *Usage example:*
	//  `{{underscoreFormat enquiry 'enquiryType'}}

	_helpers.underscoreFormat = function (obj, underscoreMethod) {
		return obj._[underscoreMethod].format();
	};

  _helpers.if_eq = function (a, b, opts) {
    if(a == b) // Or === depending on your needs
 
        return opts.fn(this);
    else
        return opts.inverse(this);
  };

  _helpers.getFirstLetter = function (name){
    var firstLetter = (name.charAt(0)); // alerts 's'
    return firstLetter;
  };

  _helpers.i18n = function (str) {
  	var text = i18n.__(str);
  	return text;
  };

  _helpers.getLang = function() {
  
		var lang = process.env.LANG;
		lang = lang.substring(0, 2);
  	return lang;
  };

	_helpers.getInLocale = function (name, name_eng, reduceStr) {
		var name = name;
		var name_eng = name_eng;
		var defaultLang;
		if (process.env.LANG == 'en') {
			if (name_eng) {
				defaultLang = name_eng;
				if (reduceStr) {
					reduceStr = parseInt(reduceStr);
					defaultLang = defaultLang.substring(0, reduceStr);
				}
				return defaultLang;
			} else {
				defaultLang = name;
				return defaultLang;
			}
		} else {
			defaultLang = name; // return in spanish
			if (reduceStr) {
				reduceStr = parseInt(reduceStr);
				try {
				defaultLang = defaultLang.substring(0, reduceStr);
				} catch(e) {
				}
			}
			return defaultLang;
		}
	};

  _helpers.getTourLocName = function(name, name_eng) {
  	var name = name;
  	var name_eng = name_eng;
  	var defaultLang;
  	if (process.env.LANG == 'en'){
  		if (name_eng) {
  			defaultLang = name_eng;
  			return defaultLang;
  		} else {
  			defaultLang = name;
  			return defaultLang;
  		}
  	} else {
  		defaultLang = name;
  		return name;
  	}
  };

  _helpers.returnLang = function () {
  	var lang = process.env.LANG;
  	var currentLang;
  	if (lang == 'es') {
  		currentLang = 'es';
  		return currentLang;
  	}
  	if (lang == 'en') {
  		currentLang = 'gb';
  		return currentLang;
  	}
  	currentLang = 'es';
  	return currentLang;
  };

	_helpers.getPriceInCurrency = function(price, currency){
		var currency = currency; 
		var convert = fx(price).from('USD').to(currency); // ~8.0424
		var priceInLocalCurrency = accounting.formatMoney(convert, {"precision": 0});
		return priceInLocalCurrency;
	};

	_helpers.getPriceInUSD = function(price){

		var convert = fx(price).from('USD').to('USD'); // ~8.0424
		var priceInUSD = accounting.formatMoney(convert, {"precision": 0});
		return priceInUSD;
	};

	_helpers.getCurrency = function(){
		var appData = "USD";
		return appData;
	}

	_helpers.for = function(from, to, incr, block) {
    var accum = '';
    for(var i = from; i <= to; i += incr)
        accum += block.fn(i);
    return accum;
	};

	_helpers.getPhoneNumberNoSpace = function() {
			return process.env.PHONE_NUMBER_NO_SPACE;
	}
	_helpers.getPhoneNumberPretty = function () {
		return process.env.PHONE_NUMBER_PRETTY;
	}

	_helpers.getSubdomain = function () {
		return process.env.SUBDOMAIN;
	}
	
	_helpers.parseDate = function(date) {
		let parsed = moment(date, "YYYY-MM-DD HH:mm z").format("YYYY-MM-DD");
		console.log(parsed);
		return parsed;
	}

	_helpers.parsePrettyDate = function (date) {
		let parsed = moment(date).format("DD MMM YYYY");
		console.log(parsed);
		return parsed;
	}

	_helpers.reduceString = function (string, reducer) {
		let str = string.substring(0, reducer);
		return str; 
	}

	_helpers.calcReview = function(review) {
		const value = parseFloat(review);
		let rounded = Math.floor(value);
		let remanente = 5-rounded;
		let str = '<i class="icon-star voted"></i>';
		let gray_star = '<i class="icon-star"></i>';
		let voted = "";
		let unvoted="";
		for (let i=0; i <rounded; i++) {
			voted = str + voted;
		}
		for (let y=0; y < remanente; y++) {
			unvoted = gray_star + unvoted;
		}
		let result = voted+unvoted;
		return result;
	}

	_helpers.paginateHelper = (currentPage, totalPages) => {
		let current = currentPage;
		let total = totalPages; // 3

		let str="";

		for (let i=1; i<=totalPages;i++) {
			if (i != current) {
				str = str + '<li class="page-item"><a class="page-link" onclick="navigatoToPage('+i+')">' + i + '</a></li>'; 
			} else {
				str = str + '<li class="page-item active"><span class="page-link">' + i +'<span class="sr-only">(current)</span></span>';
			}
		}
		return str;
	}

	_helpers.nextHelper = (currentPage, totalPages) => {
		if (!currentPage) {
			let currentPage = 1;
		}
		let difference = totalPages - currentPage;
		let nextPage = currentPage + 1;
		let nextUrl = "&page="+nextPage;
		if (difference == 0) { // you're in last page
			return null;
		} else {
			return nextUrl;
		}
	};

	_helpers.prevHelper = (currentPage) => {
		if (!currentPage) {
			let currentPage = 1;
		}
		let prevPage = currentPage - 1;
		let prevUrl = "&page=" + prevPage;
		console.log("prevUrl", prevUrl);
		if (currentPage == 1 || !currentPage || currentPage == 0)  { //you're in first page 
			return null;
		} else {
			return prevUrl;
		}


	};
	return _helpers;
};
