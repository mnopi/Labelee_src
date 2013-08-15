var Coupon = {

    limit_margin_top: 0.3,
    limit_margin_bottom: 0.92,
    opened: false,

    i: 0,

    init: function()
    {
//        Hammer(document.body, { prevent_default: true });


        $('body').append('' +
            '<div id="coupon">' +
                '<div class="sheet s1"></div>' +
                '<div class="sheet s2">' +
                    '<h1>Oferta botellita 5 fantas por 2€</h1>' +
                    '<span>¡¡Acude antes de las 20.00!!</span>' +
            '   </div>' +
            '</div>'
        );
        this.$el = $('#coupon');
        this.top = parseInt(this.$el.css('margin-top'));
        this.initial_top = this.top;
        this.current_margin_top = self.top / $(window).height(); // ~0.8

        // Eventos sobre el cupón
        this.events.bindAll();
    },

    handlers:
    {
        drag: function(ev)
        {
            var self = Coupon;

            if(self.opened && ev.gesture['deltaY'] < 0)
                return;

            console.log('drag nro: ' + self.i++);

            self.top_new = self.top + ev.gesture['deltaY'];

            // margin en %, top en px

            if(self.current_margin_top < self.limit_margin_top)
            {
                self.top_new = $(window).height() * self.limit_margin_top;
                return;
            }
            else if(self.current_margin_top > self.limit_margin_bottom)
            {
                self.top_new = $(window).height() * self.limit_margin_bottom;
                return;
            }

            self.$el.css({
                'margin-top': self.top_new + 'px'
            });
        },

        dragEnd: function(ev)
        {
            var self = Coupon;

//        ev.preventDefault();

            console.log(self.top_new);

            if(ev.gesture['deltaY'] < 20)
            {
//            console.log('abierto');
//            console.log(ev.gesture['deltaY']);
                self.opened = true;
                self.top_new = $(window).height() * self.limit_margin_top;
            }
            else if(ev.gesture['deltaY'] > 20)
            {
//            console.log('cerrado');
//            console.log(ev.gesture['deltaY']);
                self.opened = false;
                self.top_new = self.initial_top;
            }

//        if(self.top_new > 0 || self.$listMenu.height() < self.$wrapper.height())
//            self.top_new = 0;
//        else if(Math.abs(self.top_new) > self.$listMenu.height() - self.$wrapper.height())
//            self.top_new = $('nav').height() - self.$listMenu.height();


            // map.css({
            // 	'transition': 'top 1s linear 2s, left 1s linear 2s'
            // });

            self.$el.css({
                'margin-top': self.top_new + 'px'
            });

            self.top = self.top_new;

            self.i = 0;
        }
    },

    events: {
        drag: function()
        {
            var self = Coupon;

            self.$el.hammer({ prevent_default: true })
                .bind('drag', self.handlers.drag)
                .bind('dragend', self.handlers.dragEnd)
        },

        clickCoupon: function()
        {
            var self = Coupon;

            self.$el.find('span').hammer({prevent_default: true })
                .bind('tap', function(){
                    drawRoute(qrPoint.point.id, 5894);
                    self.top_new = self.initial_top;
                    self.$el.css({'margin-top': self.top_new + 'px'});
                    self.opened = false;
                    self.top = self.top_new;
                });
        },

        chooseCoupon: function()
        {
            var self = Coupon;

            self.$el.find('.sheet').hammer({prevent_default: true })
                .bind('tap', function(){

                    var lastSheet = $(this).is(':last-child');
                    if(lastSheet)
                    {
//                        $(this).hammer({stop_propagation: true}).unbind('touch click tap');
////                        $(this).siblings().hammer({stop_propagation: true}).unbind('drag');
                        return;
                    }

                    console.log('choose');

                    $coupon = $(this).parent();
                    $this= $(this).clone().css({
                        'top': '-95%',
                        'left': '20%'
                    });
                    $(this).remove();
                    $coupon.append($this);
                    $this.siblings().css({
                        'top': 0,
                        'left': '10%'
                    });


                    self.events.bindAll();
                });
        },

        bindAll: function()
        {
            var self = Coupon;
            self.$el.off();
            self.$el.find('.sheet').hammer().unbind('tap');

            self.events.drag();
            self.events.clickCoupon();
            self.events.chooseCoupon();
        }
    }





};