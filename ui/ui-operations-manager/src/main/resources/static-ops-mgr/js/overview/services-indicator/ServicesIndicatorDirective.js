/*
 * Copyright (c) 2015.
 */

(function () {

    var directive = function () {
        return {
            restrict: "EA",
            scope: true,
            bindToController: {
                panelTitle: "@",
                refreshIntervalTime: "@"
            },
            controllerAs: 'vm',
            templateUrl: 'js/overview/services-indicator/services-indicator-template.html',
            controller: "ServicesIndicatorController",
            link: function ($scope, element, attrs) {
                $scope.$on('$destroy', function () {

                });
            } //DOM manipulation\}
        }

    };

    var controller = function ($scope, $element, $http, $interval, $timeout,ServicesStatusData) {
        var self = this;
        this.dataLoaded = false;

        this.chartApi = {};

        this.chartOptions = {
            chart: {
                type: 'pieChart',
                x: function(d){return d.key;},
                y: function(d){return d.value;},
                showLabels: false,
                duration: 100,
                "height": 150,
                labelThreshold: 0.01,
                labelSunbeamLayout: false,
                "margin":{"top":10,"right":10,"bottom":10,"left":10},
                donut:true,
                donutRatio:0.65,
                showLegend:false,
                valueFormat: function(d){
                    return parseInt(d);
                },
                color:function(d){
                    if(d.key == 'UP'){
                        return '#009933';
                    }
                    else if( d.key== 'DOWN'){
                        return '#FF0000';
                    }
                    else if(d.key == 'WARNING') {
                        return '#FF9901';
                    }
                },
                dispatch: {
                    renderEnd: function () {

                    }
                }
            }
        };
        this.chartData = [];
        this.chartData.push({key: "UP", value: 0})
        this.chartData.push({key: "DOWN", value: 0})
        this.chartData.push({key: "WARNING", value: 0})

        this.updateChart = function(){
            var title = (self.indicator.counts.allCount)+" Total";
            self.chartOptions.chart.title=title
            if(self.chartApi.update) {
                self.chartApi.update();
            }
        }

        function validateTitle(){
            if(self.validateTitleTimeout != null){
                $timeout.cancel(self.valdateTitleTimeout);
            }
            var txt = $element.find('.nv-pie-title').text();
            if($.trim(txt) == "0 Total" && self.indicator.counts.allCount >0){
                self.updateChart();
            }
            $timeout(function() { validateTitle() },1000);

        }
        validateTitle();

        this.indicator = {
            openAlerts: [],
            toggleComponentAlert: function (event, component) {
                var target = event.target;
                var parentTdWidth = $(target).parents('td:first').width();
                component.alertDetailsStyle = 'width:' + parentTdWidth + 'px;';
                if (component.showAlerts == true) {

                    var alertIndex = _.indexOf(self.indicator.openAlerts, component);
                    if (alertIndex >= 0) {
                        self.indicator.openAlerts.splice(alertIndex, 1);
                    }
                    component.showAlerts = false;
                }
                else {
                    self.indicator.openAlerts.push(component);
                    component.showAlerts = true;
                }
            },
            allServices: [],
            counts: {errorCount: 0, allCount: 0, upCount: 0, downCount: 0, warningCount: 0},
            grouped: {
                "UP": {label: "Healthy", styleClass: "status-healthy", count: 0, data: []},
                "WARNING": {label: "Warnings", styleClass: "status-warnings", count: 0, data: []},
                "DOWN": {label: "Down", styleClass: "status-errors", count: 0, data: []}
            },
            percent: 0,
            dateTime: null,
            reset: function () {
                this.openAlerts = [];
                this.counts = {errorCount: 0, allCount: 0, upCount: 0, downCount: 0, warningCount: 0};
                this.percent = 0;
                this.dateTime = null;
                this.allServices = [];
                angular.forEach(this.grouped, function (groupData, status) {
                    groupData.data = [];
                    groupData.count = 0;
                })
            },
            addService: function (service) {
                this.grouped[service.state].data.push(service);
                this.grouped[service.state].count++;
                service.latestAlertTimeAgo = null;
                //update timeAgo text
                if (service.latestAlertTimestamp != null) {
                    service.latestAlertTimeAgo = moment(service.latestAlertTimestamp).from(moment());
                }
            },
            checkToShowClusterName:function(service){
              if(service && service.components){
                  var componentNames = _.map(service.components,function(component){
                      return component.name;
                  });
                  var unique = _.uniq(componentNames);
                  if(componentNames.length != unique.length){
                      service.showClusterName = true;
                  }
                  else {
                      service.showClusterName = false;
                  }
              }
            },
            addServices: function (services) {
                if (this.openAlerts.length == 0) {
                    this.reset();
                    this.allServices = services;
                    angular.forEach(services, function (service, i) {
                        self.indicator.addService(service);
                        service.componentCount = service.components.length;
                        service.healthyComponentCount = service.healthyComponents.length;
                        service.unhealthyComponentCount = service.unhealthyComponents.length;
                        self.indicator.checkToShowClusterName(service);
                    });

                    this.updateCounts();
                    this.updatePercent();


                    this.dateTime = new Date();
                }
            },
            updateCounts: function () {
                this.counts.upCount = this.grouped["UP"].count;
                this.counts.allCount = this.allServices.length;
                this.counts.downCount = this.grouped["DOWN"].count;
                this.counts.warningCount = this.grouped["WARNING"].count;
                this.counts.errorCount = this.counts.downCount + this.counts.warningCount;
                angular.forEach(self.chartData,function(item,i) {
                    item.value = self.indicator.grouped[item.key].count;
                })
                self.chartOptions.chart.title = this.counts.allCount+" Total ";
            },
            updatePercent: function () {
                if (this.counts.upCount > 0) {
                    this.percent = (this.counts.upCount / this.counts.allCount) * 100;
                    this.percent = Math.round(this.percent);
                }
                if (this.percent <= 50) {
                    this.healthClass = "errors";
                }
                else if (this.percent < 100) {
                    this.healthClass = "warnings";
                }
                else {
                    this.healthClass = "success";
                }

            }


        }




        $scope.$watch(
            function () {
                return ServicesStatusData.services;
            },
            function (newVal) {
                var servicesArr = [];
                for(var k in newVal) {
                    servicesArr.push(newVal[k]);
                }
                self.indicator.addServices(servicesArr);
                self.dataLoaded = true;
            },true
        );


        this.clearRefreshInterval = function () {
            if (self.refreshInterval != null) {
                $interval.cancel(self.refreshInterval);
                self.refreshInterval = null;
            }
        }

        this.setRefreshInterval = function () {
            self.clearRefreshInterval();
            if (self.refreshIntervalTime) {
                self.refreshInterval = $interval(self.getIndicatorMetrics, self.refreshIntervalTime);

            }
        }


        $scope.$on('$destroy', function () {
           self.clearRefreshInterval();
        });
    };

    angular.module(MODULE_OPERATIONS).controller('ServicesIndicatorController', controller);


    angular.module(MODULE_OPERATIONS)
        .directive('tbaServicesIndicator', directive);

}());


angular.module(MODULE_OPERATIONS).controller('ServicesIndicatorModalInstanceController', function ($scope, $modalInstance, indicator) {

    $scope.indicator = indicator;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
