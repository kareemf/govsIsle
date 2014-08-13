'use strict';
var services = angular.module('app.services');

services.factory('Shared', [function(){
	var self = this;
	self.data = {
        getMarkerGeoLocation: function(marker){
            //8/6/14: Position.A seems to have been replaced with position.B
            var position = marker.position
            return [position.k, position.A || position.B];
        }
    };
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
    //note: isFeautred
    var events=[
        {'id':1,
        'slug': "first-ever-nolan-park-scavenger",
        'name':"First Ever Nolan Park Scavenger",
        'type': "event",
        'isFeautred': ['archive'],
        'description': "Download the <a href='http://www.govisland.com/downloads/pdf/explore-nolan-scavenger-hunt.pdf'>scavenger hunt</a> or pick it up a sheet at the Governors Island Alliance (GIA) welcome tables on the Island. Answer 11 questions correctly, take and post a selfie in Nolan Park and complete the scavenger hunt! Then bring the completed sheet to the GIA table at Soissons Landing and get a prize. Visitors can compete in one of three categories: as a team, an individual or a child under 12. The first five teams to complete the hunt get a gift certificate for a free surrey from Blazing Saddles. There are a variety of additional prizes for those in the individuals and children categories. All prizes are provided by a number of organizations and vendors on the Island.",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/02/2014 13:00:00'),
        'endDateTime': new Date('08/02/2014 17:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': false,
        'anticipatedAttendance': 0,
        'location': 'Nolan Park',
        'geoLocation': [40.689681, -74.013973],
        'media': 'https://govislandblog.files.wordpress.com/2014/07/nolan_01.jpg'
        },
        {'id':2,
        'name':"Rite of Summer presents Pam Goldberg",
        'type': "event",
        'isFeautred': ['archive'],
        'description': "American and Argentine Sounds from Ives to Piazzolla featuring ROS Co-Founder & pianist Pam Goldberg, violinist Esther Noh, cellist Caitlin Sullivan and soprano Allison Charney.<br/><a href='http://www.riteofsummer.com'>www.riteofsummer.com</a>",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/09/2014 13:00:00'),
        'endDateTime': new Date('08/09/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': false,
        'anticipatedAttendance': 53,
        'location': 'Colonels Row',
        'geoLocation': [40.690795, -74.019004],
        'media': 'http://riteofsummer.com/wp-content/uploads/2014/05/Pam-Goldberg-Esther-Noh-Caitlin-Sullivan-Allison-Charney.jpg'
        },
        {'id':3,
        'name':"Jazz Age Lawn Party",
        'type': "event",
        'isFeautred': ['event','main'],
        'description': "Michael Arenella and His Dreamland Orchestra invite you to the beloved Jazz Age Lawn Party -- a dream of the 1920s nestled right in the heart of New York Harbor! Under a canopy of century trees, caressed by fresh sea air, a delightful array of offerings abound throughout the day including: live music and dance performances, dance instruction for the hottest dance steps of the time, games for all ages and a wide variety of 1920's inspired refreshments and gourmet food for purchase. Tickets are required for this event and can be purchased at <a href='http://www.jazzagelawnparty.com'>www.jazzagelawnparty.com</a>. If space is available, tickets will be sold at the door.",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/14/2014 11:00:00'),
        'endDateTime': new Date('08/15/2014 17:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Colonels Row',
        'geoLocation': [40.690746, -74.019037],
        'media': '/images/jazz.jpg'
        },
        {'id':4,
        'name':"RECESS BOCCE",
        'type': "event",
        'isFeautred': [],
        "description": "Itchy for bocce anyone? Join RECESS for a day of outdoor fun in the sun as 32 creative organizations put their lawn skills to the test, rolling and knocking off each other's bocce balls on the makeshift grass courts on Colonel's Row. Festivities include free bike rides, food vendors, a beer/wine tent and guest deejays. A few courts will also be open to the public. Visit <a href='http://www.recessnewyork.com'>http://www.recessnewyork.com</a> for more information.",       
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/23/2014 12:00:00'),
        'endDateTime': new Date('08/23/2014 17:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': false,
        'anticipatedAttendance': 0,
        'location': 'Colonels Row',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://recessnewyork.com/content/home/1.jpg'
        },
        {'id':5,
        'name':"The NYC Volkswagen Traffic",
        'type': "event",
        'isFeautred': ['event'],
        "description": "The Traffic Jam is a spectator-judged vintage Volkswagen car show and picnic. With great views behind a vibrant line-up of nearly 100 Beetles, buses, dune buggies, Things, and other original VW's circa 1950's - 1970's, this car show is a one-of-a-kind event for both the casual spectator and classic VW enthusiast. Because show cars ride a ferry to get to the event, registration is mandatory to secure a spot at the show. Registration opens June 30th. Registration will be first-come, first-served. Car Registration $20.00 and spectators attend for free. Visit <a href='http://www.vwtrafficjam.com'>www.vwtrafficjam.com</a>",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/24/2014 10:00:00'),
        'endDateTime': new Date('08/24/2014 17:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': false,
        'anticipatedAttendance': 0,
        'location': 'Colonels Row',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://www.oldvwlovers.org/Litchfield-1.jpg'
        },
        {'id':6,
        'name':"NYC Unicycle Festival",
        'type': "event",
        'isFeautred': [],
        "description": "The New York City Unicycle Festival brings together recreational riders, world-class performers, mountain and off-road unicycle enthusiasts, mono-wheel vehicle inventors, along with circus enthusiasts, extreme sports viewers, and anyone seeking an unusual sight--even for NYC! You will witness unicycle basketball, hockey and sumo. Learn to unicycle in the learn-to-ride area. Produced by Bindlestiff Family Variety Arts. For more information visit <a href='http://nycunifest.com'>nycunifest.com</a>",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/30/2014 12:00:00'),
        'endDateTime': new Date('08/31/2014 17:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Gover island',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://nycunifest.com/wp-content/uploads/2014/07/NYC-Uni-Fest-2013-photocred_Michael-Dwass_0445.jpg'
        },
        {'id':7,
        'name':"Rite of Summer presents Grand Band",
        'type': "event",
        'isFeautred': [],
        "description": "New York's piano sextet Grand Band presents A Bigger Picture - performed by ROS Co-Founder & pianist Blair McMillen, Vicky Chow, David Friend, Paul Kerekes, Lisa Moore and Isabelle O'Connell. The New York Times calls Grand Band “the Traveling Wilburys of the city's new-music piano scene.” They will present a program of recent works by Philip Glass, Kate Moore, Steve Reich and two New York premieres by Michael Gordon and Paul Kerekes. <a href='http://www.riteofsummer.com'>www.riteofsummer.com</a>",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Colonels Row',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://riteofsummer.com/wp-content/uploads/2014/05/grand-band.jpg'
        },
        {'id':8,
        'name':"Explore Castle Williams",
        'type': "tour",
        'isFeautred': ['main'],
        "description": "Tours on the half hour from 11:30 AM till 4:30 PM. About 30 minutes. Get some history in the round at the best-preserved circular fortification in the nation. A portion of Castle Williams is without power. Castle roof tours are suspended and Castle interiors are closed to the public. The courtyard remains open Wednesday through Sunday and rangers are there waiting to see you",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/17/2014 15:30:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Castle Williams',
        'geoLocation': [40.692785, -74.019406],
        'media': '../images/castle-williams.jpg'
        },
        {'id':9,
        'name':"Experience Fort Jay: An Island Star!",
        'type': "tour",
        'isFeautred': [],
        "description": "On the half hour, 11:30 PM to 3:30 PM (last one is at 12:30 PM on Thursday). Starts at the front drawbridge entrance to Fort Jay. About 30 minutes. Fortify your mind! Tour one of the best examples of classic star-shaped fort design anywhere in the country, including the oldest structure on the island.",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/13/2014 11:30:00'),
        'endDateTime': new Date('08/15/2014 15:30:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Fort Jay',
        'geoLocation': [40.691306, -74.016041],
        'media': 'http://www.nps.gov/gois/historyculture/images/FJ-aerial.jpg'
        },
        {'id':10,
        'name':"For Kids! From Drills to Drums: Civil War Life",
        'type': "tour",
        'isFeautred': [],
        "description": "10:20 and 11:20 AM at Soissons Dock. About 45 minutes. Take a step into the past and meet island residents from hundreds of years ago. Kids and grown-ups will see first-hand the lives of soldiers, civilians and prisoners on the island in the 19th century. No tickets or reservations required, but if you're a large school or day camp group, we'd appreciate it if you drop us a line at 212-825-3045 to let us know how many you'll be.",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/13/2014 10:20:00'),
        'endDateTime': new Date('08/15/2014 11:20:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': ' ',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://3.bp.blogspot.com/-VKuk8R3wnxI/Tkg1Fygm34I/AAAAAAAAAmw/e57pGX5A1iA/s1600/081311171716.jpg'
        },
        {'id':11,
        'name':"Hike through History",
        'type': "tour",
        'isFeautred': [],
        "description": "About 90 minutes. See the whole history of the island in one go. Our most comprehensive program takes you to nearly every highlight in the historic district. No tickets or reservations required. Visitors should be prepared to stand for a full 90 minutes and walk a distance of about 1.5 miles. Offered on Wednesday and Friday. Not offered on Thursday in July.",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/13/2014 14:30:00'),
        'endDateTime': new Date('08/15/2014 15:30:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Soissons Dock',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://upload.wikimedia.org/wikipedia/commons/6/67/Fort_Jay_and_Manhattan_Skyscrapers,_Governor\'s_Island_NY.jpg'
        },
        {'id':12,
        'name':"Artillery Thursday!",
        'type': "tour",
        'isFeautred': [],
        "description": "Ready for the big boom? Learn about the life of a 19th-century artillerist and the ammunition and weaponry they used. A loud, smoke and flame spiting cannon demonstration. Then travel to Fort Jay and look at the big 5 and 7 ton Civil War cannons. No tickets or reservations required (just consider bringing your ear plugs).",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'eastern entrance to Fort Jay',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://2.bp.blogspot.com/-5Ju7NqRgmvU/Tkg5Ik0lihI/AAAAAAAAAm8/yYpSw7h_aw8/s1600/2011-08-13_14-50-16_368.jpg'
        },
        {'id':13,
        'name':"Nolan Park: A Commanding Presence",
        'type': "tour",
        'isFeautred': [],
        "description": "About 30 minutes. Take a stroll through the genteel neighborhood that played home to generations of the highest-ranking officers stationed on Governors Island.",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Commanding Officer\'s Quarters',
        'geoLocation': [40.690746, -74.019037],
        'media': 'http://govislandblog.files.wordpress.com/2008/07/governorsisland_jcl_photo1.jpg'
        },
        {'id':14,
        'name':"Visit the Arsenal District",
        'type': "tour",
        'isFeautred': [],
        "description": "About 30 minutes. Did you know that for decades, Governors Island housed not one, but two military bases? Explore Governors Island's very own \"heat-packing district\" where the US Army managed munitions and arms during the 19th and 20th centuries.",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Soissons Dock',
        'geoLocation': [, ],
        'media': 'http://2.bp.blogspot.com/-5Ju7NqRgmvU/Tkg5Ik0lihI/AAAAAAAAAm8/yYpSw7h_aw8/s1600/2011-08-13_14-50-16_368.jpg'
        },
        {'id':15,
        'name':"Hike through History",
        'type': "tour",
        'isFeautred': [],
        "description": "See the whole history of the island in one go. Our most comprehensive program takes you to nearly every highlight in the historic district. No tickets or reservations required. Visitors should be prepared to stand for a full 90 minutes and walk a distance of about 1.5 miles.",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Soissons Dock',
        'geoLocation': [, ],
        'media': 'http://upload.wikimedia.org/wikipedia/commons/6/67/Fort_Jay_and_Manhattan_Skyscrapers,_Governor\'s_Island_NY.jpg'
        },
        {'id':16,
        'name':"Envision the Dream Artworks by Seniors",
        'type': "venue",
        'isFeautred': ['main'],
        "description": "Eleven senior artists will exhibit work in group and solo exhibitions in all media. Because the art world tends to focus on new and upcoming artists or established artists often mid-career senior artists find themselves overlooked by the mainstream media. This exhibition will draw attention and recognition to a diverse group of talented senior artists working in both traditional and non-traditional styles. <a href='http://www.newcenturyartists.org'>www.newcenturyartists.org</a>",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('09/06/2014 10:00:00'),
        'endDateTime': new Date('09/21/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Nolan Park',
        'geoLocation': [, ],
        'media': '../images/senior-art.jpg'
        },
        {'id':17,
        'name':"Interactive Exhibit",
        'type': "venue",
        'isFeautred': [],
        "description": "Visit the interactive exhibit in Building 110 to learn more about Governors Island's new park and public spaces and The Hills as they are under construction. Visitors are invited to use Post It™ notes, markers and stamps to provide their feedback about what's happening on the Island.",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('05/24/2014 13:00:00'),
        'endDateTime': new Date('09/28/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Building 110',
        'geoLocation': [, ],
        'media': 'http://www.nps.gov/hfc/products/exhibits/features/2012/castlewilliams/model.jpg'
        },
        {'id':18,
        'name':"Empire Historic Arts Fund presents",
        'type': "venue",
        'isFeautred': [],
        "description": "An installation of costume de-accessioned from various museums due to condition issues that make them undesirable for exhibit in the upper echelon museum world. Empire Historic Arts believes their inherent beauty and value is easily recognizable and that they are a great resource for those interested in the design and construction of late 18th and 19th century garments. <a href='http://www.empirehistoricarts.org'>empirehistoricarts.org</a>",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Building 20A in Nolan Park',
        'geoLocation': [, ],
        'media': 'http://thedreamstress.com/wp-content/uploads/2012/06/Wedding-dress-French-1872-bengaline-silk-with-waxed-orange-blossoms-from-Mon.-Vignon-182-Rue-de-Rivoli-Paris.jpg'
        },
        {'id':19,
        'name':"Bike & Surrey Rentals",
        'type': "activity",
        'isFeautred': [],
        "description": "Saddles Colonels Row, 10am-5pm *FREE cruiser bikes Mon-Fri, 10am-12pm",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Colonels Row',
        'geoLocation': [, ],
        'media': 'https://govislandblog.files.wordpress.com/2014/07/blazingsaddles_v5_460x285.jpg'
        },
        {'id':20,
        'name':"FIGMENT Mini Golf, Tree House & Sculpture",
        'type': "activity",
        'isFeautred': [],
        "description": "Presented by FIGMENT Monday-Sunday 12pm-5pm Parade Ground",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Colonels Row',
        'geoLocation': [, ],
        'media': 'http://www.glenwoodnyc.com/manhattan-living/wp-content/uploads/resource/gi-city-of-dreams-mini-golf.jpg'
        },
        {'id':21,
        'name':"Compost Learning Center",
        'type': "activity",
        'isFeautred': [],
        "description": "Presented by Earth Matter Saturdays & Sundays 12pm-4pm Urban Farm",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'Colonels Row',
        'geoLocation': [, ],
        'media': 'http://govislandblog.files.wordpress.com/2013/08/cream.jpg'
        },
        {'id':22,
        'name':"Roller Skate Rentals",
        'type': "activity",
        'isFeautred': [],
        "description": "Presented by Skate Truck NYC Wednesday-Friday, 10am-5pm ",
        'visibility': 'public',
        'setupDateTime': new Date(),
        'startDateTime': new Date('08/24/2014 13:00:00'),
        'endDateTime': new Date('08/24/2014 15:00:00'),
        'cleanupDateTime': new Date(),
        'isReccuring': true,
        'anticipatedAttendance': 0,
        'location': 'South Battery',
        'geoLocation': [, ],
        'media': 'http://wheresmybackpack.files.wordpress.com/2013/02/figment-festival-procession.jpg'
        }
    ];

    var subEvents= [
        {'id':1,
         'name': 'Discover',
         'type': 'active',
         'visibility': 'public',
         'activeBtn': 2,
         'link': 'events.grid',
         'media': "images/landing/Thumb_discover_320x250.jpg"
        },
        {'id':2,
         'name': 'Eat',
         'type': 'active',
         'visibility': 'public',
         'activeBtn': 3,
         'link': 'home.map',
         'media': "images/landing/Thumb_eat_320x250.jpg"
        },
        {'id':3,
         'name': 'Enjoy',
         'type': 'active',
         'visibility': 'public',
         'activeBtn': 3,
         'link': 'home.map',
         'media': "images/landing/Thumb_enjoy_320x250.jpg"
        },
        {'id':4,
         'name': 'Learn',
         'type': 'active',
         'visibility': 'public',
         'activeBtn': 4,
         'link': 'tours',
         'media': "images/landing/Thumb_learn_320x250.jpg"
        }
    ];

    return {
        updateSiteData : function(newval) {
            $rootScope.$broadcast('YChanged', activelink);
        },
        getEvents :function(){return events;},
        getSubEvents :function(){return subEvents;},

   };
})




