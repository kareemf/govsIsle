'use strict';
var services = angular.module('app.services');

services.factory('Shared', [function(){
	var self = this;
	self.data = {};
	return self.data;
}]);

services.factory('NavService',function($rootScope){
    var activelink=null, hideInfo=null;
    return {
        updateBtn : function(newval) {
            activelink=newval;
            $rootScope.$broadcast('XChanged', activelink);
        },
        getBtn :function(){
            return activelink;
        },
        getHiddenBtn : function(){
            if(activelink===2 || activelink===3 || activelink===4 || activelink===6){
                return true;
            }
            else{return false;}
        }
   };
})

services.factory('SiteData', function($rootScope){
    //replace event with queries
    var events=[
        {'id':1,
        'name':"First Ever Nolan Park Scavenger",
        'type': "event",
        "isFeautred": "none",
        'description': "Download the <a href='http://www.govisland.com/downloads/pdf/explore-nolan-scavenger-hunt.pdf'>scavenger hunt</a> or pick it up a sheet at the Governors Island Alliance (GIA) welcome tables on the Island. Answer 11 questions correctly, take and post a selfie in Nolan Park and complete the scavenger hunt! Then bring the completed sheet to the GIA table at Soissons Landing and get a prize. Visitors can compete in one of three categories: as a team, an individual or a child under 12. The first five teams to complete the hunt get a gift certificate for a free surrey from Blazing Saddles. There are a variety of additional prizes for those in the individuals and children categories. All prizes are provided by a number of organizations and vendors on the Island.",
        'visibility': 'public',
        'setupDateTime': new Date('08/02/2014 12:00:00'),
        'startDateTime': new Date('08/02/2014 13:00:00'),
        'endDateTime': new Date('08/02/2014 17:00:00'),
        'cleanupDateTime': new Date('08/02/2014 18:00:00'),
        'isReccuring': false,
        'anticipatedAttendance': 0,
        'location': 'Nolan Park',
        'geoLocation': [40.689681, -74.013973],
        'media': 'https://govislandblog.files.wordpress.com/2014/07/nolan_01.jpg'
        },
        {'id':2,
        'name':"Rite of Summer presents Pam Goldberg, Esther Noh, Caitlin Sullivan & Allison Charney",
        'type': "event",
        "isFeautred": "none",
        'description': "American and Argentine Sounds from Ives to Piazzolla featuring ROS Co-Founder & pianist Pam Goldberg, violinist Esther Noh, cellist Caitlin Sullivan and soprano Allison Charney.<br/><a href=\'www.riteofsummer.com\'>www.riteofsummer.com</a>",
        'visibility': 'public',
        'setupDateTime': new Date('08/02/2014 12:00:00'),
        'startDateTime': new Date('08/09/2014 13:00:00'),
        'endDateTime': new Date('08/09/2014 15:00:00'),
        'cleanupDateTime': new Date('08/09/2014 17:00:00'),
        'isReccuring': false,
        'anticipatedAttendance': 53,
        'location': 'Colonels Row',
        'geoLocation': [40.690795, -74.019004],
        'media': 'http://riteofsummer.com/wp-content/uploads/2014/05/Pam-Goldberg-Esther-Noh-Caitlin-Sullivan-Allison-Charney.jpg'
        },
        {'id':3,
        'name':"Jazz Age Lawn Party",
        'type': "event",
        "isFeautred": "event",
        'description': "Michael Arenella and His Dreamland Orchestra invite you to the beloved Jazz Age Lawn Party -- a dream of the 1920s nestled right in the heart of New York Harbor! Under a canopy of century trees, caressed by fresh sea air, a delightful array of offerings abound throughout the day including: live music and dance performances, dance instruction for the hottest dance steps of the time, games for all ages and a wide variety of 1920's inspired refreshments and gourmet food for purchase. Tickets are required for this event and can be purchased at <a href='www.jazzagelawnparty.com'>www.jazzagelawnparty.com</a>. If space is available, tickets will be sold at the door.",
        'visibility': 'public',
        'setupDateTime': new Date('08/02/2014 12:00:00'),
        'startDateTime': new Date('08/16/2014 11:00:00'),
        'endDateTime': new Date('08/16/2014 17:00:00'),
        'cleanupDateTime': new Date('08/02/2014 18:00:00'),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Colonels Row',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://www.jazzagelawnparty.com/img/gallery/entertainment/6B6A8065.jpg'
        },
        {'id':4,
        'name':"RECESS BOCCE",
        'type': "event",
        "isFeautred": "none",
        "description": "Itchy for bocce anyone? Join RECESS for a day of outdoor fun in the sun as 32 creative organizations put their lawn skills to the test, rolling and knocking off each other's bocce balls on the makeshift grass courts on Colonel's Row. Festivities include free bike rides, food vendors, a beer/wine tent and guest deejays. A few courts will also be open to the public. Visit <a href='http://www.recessnewyork.com'>http://www.recessnewyork.com</a> for more information.",       
        'visibility': 'public',
        'setupDateTime': new Date('08/02/2014 12:00:00'),
        'startDateTime': new Date('08/23/2014 12:00:00'),
        'endDateTime': new Date('08/23/2014 17:00:00'),
        'cleanupDateTime': new Date('08/02/2014 18:00:00'),
        'isReccuring': false,
        'anticipatedAttendance': 0,
        'location': 'Colonels Row',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://recessnewyork.com/content/home/1.jpg'
        },
        {'id':5,
        'name':"The NYC Volkswagen Traffic",
        'type': "event",
        "isFeautred": "none",
        "description": "The Traffic Jam is a spectator-judged vintage Volkswagen car show and picnic. With great views behind a vibrant line-up of nearly 100 Beetles, buses, dune buggies, Things, and other original VW's circa 1950's - 1970's, this car show is a one-of-a-kind event for both the casual spectator and classic VW enthusiast. Because show cars ride a ferry to get to the event, registration is mandatory to secure a spot at the show. Registration opens June 30th. Registration will be first-come, first-served. Car Registration $20.00 and spectators attend for free. Visit <a href='www.vwtrafficjam.com'>www.vwtrafficjam.com</a>",
        'visibility': 'public',
        'setupDateTime': new Date('08/02/2014 12:00:00'),
        'startDateTime': new Date('08/24/2014 10:00:00'),
        'endDateTime': new Date('08/24/2014 17:00:00'),
        'cleanupDateTime': new Date('08/24/2014 18:00:00'),
        'isReccuring': false,
        'anticipatedAttendance': 0,
        'location': 'Colonels Row',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://www.oldvwlovers.org/Litchfield-1.jpg'
        },
        {'id':6,
        'name':"NYC Unicycle Festival",
        'type': "event",
        "isFeautred": "none",
        "description": "The New York City Unicycle Festival brings together recreational riders, world-class performers, mountain and off-road unicycle enthusiasts, mono-wheel vehicle inventors, along with circus enthusiasts, extreme sports viewers, and anyone seeking an unusual sight--even for NYC! You will witness unicycle basketball, hockey and sumo. Learn to unicycle in the learn-to-ride area. Produced by Bindlestiff Family Variety Arts. For more information visit <a href='nycunifest.com'>nycunifest.com</a>",
        'visibility': 'public',
        'setupDateTime': new Date('08/02/2014 12:00:00'),
        'startDateTime': new Date('08/24/2014 10:00:00'),
        'endDateTime': new Date('08/24/2014 17:00:00'),
        'cleanupDateTime': new Date('08/24/2014 18:00:00'),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Colonels Row',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://nycunifest.com/wp-content/uploads/2014/07/NYC-Uni-Fest-2013-photocred_Michael-Dwass_0445.jpg'
        },
        {'id':7,
        'name':"Rite of Summer presents Grand Band",
        'type': "event",
        "isFeautred": "none",
        "description": "New York's piano sextet Grand Band presents A Bigger Picture - performed by ROS Co-Founder & pianist Blair McMillen, Vicky Chow, David Friend, Paul Kerekes, Lisa Moore and Isabelle O'Connell. The New York Times calls Grand Band “the Traveling Wilburys of the city's new-music piano scene.” They will present a program of recent works by Philip Glass, Kate Moore, Steve Reich and two New York premieres by Michael Gordon and Paul Kerekes. <a href=\'www.riteofsummer.com\'>www.riteofsummer.com</a>",
        'visibility': 'public',
        'setupDateTime': new Date('08/02/2014 12:00:00'),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date('08/24/2014 18:00:00'),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Colonels Row',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://riteofsummer.com/wp-content/uploads/2014/05/grand-band.jpg'
        },
        {'id':8,
        'name':"Explore Castle Williams",
        'type': "tour",
        "isFeautred": "event",
        "description": "Tours on the half hour from 11:30 AM till 4:30 PM. About 30 minutes. Get some history in the round at the best-preserved circular fortification in the nation. A portion of Castle Williams is without power. Castle roof tours are suspended and Castle interiors are closed to the public. The courtyard remains open Wednesday through Sunday and rangers are there waiting to see you",
        'visibility': 'public',
        'setupDateTime': new Date('08/02/2014 10:00:00'),
        'startDateTime': new Date('08/24/2014 15:30:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date('08/24/2014 18:00:00'),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Castle Williams',
        'geoLocation': [40.692785, -74.019406],
        'media': 'http://www.nps.gov/gois/planyourvisit/images/Castle-Williams-Banner.jpg'
        },
        {'id':9,
        'name':"Experience Fort Jay: An Island Star!",
        'type': "tour",
        "isFeautred": "none",
        "description": "On the half hour, 11:30 PM to 3:30 PM (last one is at 12:30 PM on Thursday). Starts at the front drawbridge entrance to Fort Jay. About 30 minutes. Fortify your mind! Tour one of the best examples of classic star-shaped fort design anywhere in the country, including the oldest structure on the island.",
        'visibility': 'public',
        'setupDateTime': new Date('08/02/2014 12:00:00'),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date('08/24/2014 18:00:00'),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Fort Jay',
        'geoLocation': [40.691306, -74.016041],
        'media': 'http://www.nps.gov/gois/historyculture/images/FJ-aerial.jpg'
        },
        {'id':10,
        'name':"For Kids! From Drills to Drums: Civil War Life on Governors Island",
        'type': "tour",
        "isFeautred": "none",
        "description": "10:20 and 11:20 AM at Soissons Dock. About 45 minutes. Take a step into the past and meet island residents from hundreds of years ago. Kids and grown-ups will see first-hand the lives of soldiers, civilians and prisoners on the island in the 19th century. No tickets or reservations required, but if you're a large school or day camp group, we'd appreciate it if you drop us a line at 212-825-3045 to let us know how many you'll be.",
        'visibility': 'public',
        'setupDateTime': new Date('08/02/2014 12:00:00'),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date('08/24/2014 18:00:00'),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': ' ',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://3.bp.blogspot.com/-VKuk8R3wnxI/Tkg1Fygm34I/AAAAAAAAAmw/e57pGX5A1iA/s1600/081311171716.jpg'
        },
        {'id':11,
        'name':"",
        'type': "tour",
        "isFeautred": "none",
        "description": "",
        'visibility': 'public',
        'setupDateTime': new Date('08/02/2014 12:00:00'),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date('08/24/2014 18:00:00'),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': '',
        'geoLocation': [, ],
        'media': ''
        }
    ];

    return {
        updateSiteData : function(newval) {
            $rootScope.$broadcast('YChanged', activelink);
        },
        getEvents :function(){return events;}
   };
})




