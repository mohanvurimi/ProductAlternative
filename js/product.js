
 var productApp = angular.module('productAlternativeApp',[]);
 productApp.controller('productAlternativeController', function ($scope, $http) {
    $scope.productData = {};
    $scope.productData.ebay = {};
    $scope.productData.walmart = {};
    
    $scope.getAlternativeProducts = function(title){
      $scope.getAlternativeProductsFromEbay(title);
      $scope.getAlternativeProductsFromWalmart(title);
    };
    
    //Get related product from ebay  	
    $scope.getAlternativeProductsFromEbay = function(title){
      var url = "http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords"+
            "&SECURITY-APPNAME=Yourcode&RESPONSE-DATA-FORMAT=json&keywords="+title;
      $http.get(url).success(
        function(response,i){
          try{
            var item = response.findItemsByKeywordsResponse[0].searchResult[0].item[0];  
          }
          catch(exception){
            return;
          }
          var name = item.title[0];
          var price = item.sellingStatus[0].convertedCurrentPrice[0].__value__;
          var productURL = item.viewItemURL[0];
          var image = item.galleryURL[0];
          $scope.productData.ebay.name = $scope.concatenatedName(name);
          $scope.productData.ebay.price = price;
          $scope.productData.ebay.productURL = productURL;
          $scope.productData.ebay.image = image;
        }
      );
    }
    
    //Get name of product truncated to 3 lines of text
    $scope.concatenatedName = function(name){
      if(name.length > 135){
        return name.slice(0,135) + "...";
      }else{
        return name;
      }
    }
    
    //Get relevant product from walmart
    $scope.getAlternativeProductsFromWalmart = function(title){
      var url = "http://api.walmartlabs.com/v1/search?query="+title+"&format=json&apiKey=yourkey";
      $http.get(url).success(
        function(response,i){
          var item;
          try {
            item = response.items[0];
          }catch(exception){
            return;
          }
          var name = item.name;
          var price = item.salePrice;
          var productURL = item.productUrl;
          var image = item.thumbnailImage;
          $scope.productData.walmart.name = $scope.concatenatedName(name);
          $scope.productData.walmart.price = price;
          $scope.productData.walmart.productURL = productURL;
          $scope.productData.walmart.image = image;
        }
      );
    }
    
    //Get title of amazon webpage and make request
    $scope.loadData = function(){
      $scope.message ="";
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        var title = tabs[0].title;
        if(tabs[0].url.indexOf('amazon.com') >= 0){
          if(title.indexOf('Amazon.com') >= 0){
            title = title.slice(title.indexOf(':')+1).trim();
          }
          title = title.replace('- ', '');
          var searchTerm = "";
          var numWords = 1;
          var i = 0;
          for(i =0; i < title.length; ++i){
            var char = title.charAt(i);
            if(char == ' '){
              numWords++;
            }
            if(char == ':'){
              numWords -= 1;
            }
            if(numWords == 7)
              break;
          }
          title = title.slice(0,i);
          $scope.getAlternativeProducts(title);
        }else{
          $scope.message = "Open this extension when browsing Amazon";
          $scope.$apply();
        }
        
      });
    };
    
    //navigate to product page
    $scope.productSelect = function(data){
      chrome.browserAction.onClicked.addListener(function(tab) {
          chrome.tabs.update(tab.id, {
              url: data.productURL
          });
      }); 
    }
    
    $scope.loadData();
});

productApp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.headers.common = 'Content-Type: application/json';
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])
