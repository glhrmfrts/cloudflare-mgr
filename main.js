angular.module('app', [])
    .service('ApiService', function($http) {
        return {
            get: function(endpoint, page) {
                return $http.post('/send.php?method=GET&endpoint=' + endpoint + '&page=' + page);
            },

            patch: function(endpoint, data) {
                return $http.post('/send.php?method=PATCH&endpoint=' + endpoint, data);
            },

            post: function(endpoint, data) {
                return $http.post('/send.php?method=POST&endpoint=' + endpoint, data);
            }
        };
    })
    .service('EventService', function() {
        var listeners = {};

        function getListeners(e) {
            if (!listeners.hasOwnProperty(e)) {
                listeners[e] = [];
            }

            return listeners[e];
        }

        return {
            emit: function() {
                var evt = arguments[0];
                var args = Array.prototype.slice.call(arguments, 1);

                var listeners = getListeners(evt);
                listeners.forEach(function(l) {
                    l.apply(null, args);
                });
            },

            listen: function(evt, l) {
                var listeners = getListeners(evt);
                listeners.push(l);
            }
        };
    })
    .controller('ZonesController', function($scope, ApiService, EventService) {
        function init() {
            ApiService.get('/zones', $scope.page)
                .success(function(response) {
                    $scope.zones = response.result;
                    $scope.total_pages = response.result_info.total_pages;
                });
        }

        function addZone() {
            EventService.emit('add_zone');
        }

        function getZoneDetails(zone_id) {
            EventService.emit('get_zone_details', zone_id);
        }

        function getZoneRecords(zone_id) {
            ApiService.get('/zones/' + zone_id + '/dns_records', $scope.zone_page[zone_id] || 1)
                .success(function(response) {
                    $scope.zone_records[zone_id] = response.result;
                    $scope.zone_open[zone_id] = true;
                    $scope.zone_total_pages[zone_id] = response.result_info.total_pages;
                });
        }

        function getRecordDetails(zone_id, record_id) {
            EventService.emit('get_record_details', zone_id, record_id);
        }

        function showZoneRecords(zone_id) {
            if ($scope.zone_records[zone_id]) {
                $scope.zone_open[zone_id] = !$scope.zone_open[zone_id];
            }
            else {
                getZoneRecords(zone_id);
            }
        }

        function setPage(page) {
            if (page < 1 || page > $scope.total_pages) return;

            $scope.page = page;
            $scope.zones = [];

            init();
        }

        function setZonePage(zone_id, page) {
            $scope.zone_page[zone_id] = page;
            getZoneRecords(zone_id);
        }

        $scope.page = 1;
        $scope.total_pages = 0;
        $scope.zone_page = {};
        $scope.zone_total_pages = {};
        $scope.zone_open = {};
        $scope.zone_records = {};
        $scope.zones = [];
        $scope.addZone = addZone;
        $scope.getZoneDetails = getZoneDetails;
        $scope.getRecordDetails = getRecordDetails;
        $scope.showZoneRecords = showZoneRecords;
        $scope.setPage = setPage;
        $scope.setZonePage = setZonePage;

        init();
    })
    .controller('ContentController', function($scope, ApiService, EventService) {
        function onGetZoneDetails(zone_id) {
            $scope.loading = true;

            ApiService.get('/zones/' + zone_id, 1)
                .success(function(response) {
                    $scope.context = 'zone';
                    $scope.loading = false;

                    $scope.zone = response.result;
                });
        }

        function onGetRecordDetails(zone_id, record_id) {
            $scope.loading = true;

            ApiService.get('/zones/' + zone_id + '/dns_records/' + record_id, 1)
                .success(function(response) {
                    $scope.context = 'record';
                    $scope.loading = false;

                    $scope.record = response.result;
                });
        }

        function addZone() {
            ApiService.post('/zones', $scope.new_zone)
                .success(function(response) {
                    if (response.success) {
                        $scope.context = 'zone';
                        $scope.zone = response.result;
                        $scope.new_zone = {};

                        return toastr.success('Zone added', 'Success');
                    }
                    else {
                        return toastr.error(response.errors[0].message, 'Error');
                    }
                });
        }

        function addRecord() {
            ApiService.post('/zones/' + $scope.zone.id + '/dns_records/', $scope.new_record)
                .success(function(response) {

                    if (response.success) {
                        $scope.context = 'record';
                        $scope.record = response.result;
                        $scope.new_record = {};

                        return toastr.success('Record added', 'Success');
                    }
                    else {
                        return toastr.error(response.errors[0].message, 'Error');
                    }
                });
        }

        function updateRecord(record) {
            ApiService.patch('/zones/' + record.zone_id + '/dns_records/' + record.id, record)
                .success(function(response) {
                    if (response.success) {
                        return toastr.success('Record updated', 'Success');
                    }
                    else {
                        return toastr.error(response.errors[0].message, 'Error');
                    }
                });
        }

        $scope.context = 'new_zone';
        $scope.loading = false;
        $scope.zone = null;
        $scope.record = null;
        $scope.new_record = {};
        $scope.new_zone = {};
        $scope.updateRecord = updateRecord;
        $scope.addRecord = addRecord;
        $scope.addZone = addZone;
        $scope.setContext = function(c) { $scope.context = c; };

        EventService.listen('add_zone', $scope.setContext.bind(null, 'new_zone'));
        EventService.listen('get_zone_details', onGetZoneDetails);
        EventService.listen('get_record_details', onGetRecordDetails);
    });
