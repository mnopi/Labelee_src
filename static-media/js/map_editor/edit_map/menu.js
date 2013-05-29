
var LabelCategory = {

    show_form_new: function()
    {
        $e.label.form.root_node.hide(400);
        $e.category.form.root_node.show(400);
    },


    show_form_update: function(){
        // implementar
    },


    create: function()
    {
        //
        // 1: Creamos el registro en B.D.
        var data = {
            'name': $e.category.form.name.val(),
            'color': $e.category.form.color.val()
        };

        Menu.category_created = new LabelCategoryResource().create(data);

        // 2. Si se ha elegido una imágen la subimos
        var img_form = $(this).closest('form');

        if(!img_form.find('input[name=img]').val())
        {
            LabelCategory._post_create();
            return;
        }

        Menu.sending_img = true;

        new LabelCategoryResource().addImg(
            img_form,
            Menu.category_created.id,
            function(server_response){
                LabelCategory._post_create();
                Menu.sending_img = false;
            }
        );
    },


    // Una vez la categoría está creada se hace esto también:
    _post_create: function()
    {
        $e.category.form.name.val('');
        $e.category.form.img.val('');
        $e.category.form.color.val('');
        $e.category.form.root_node.hide(400);

        // volvemos a rellenar el selector con el nuevo dato
        Menu.setCategorySelector();

        Menu.category_created = null;
    },


    update: function()
    {

    },


    delete: function()
    {
        var category_id = $e.category.selector.val();
        var confirm_msg = '¿Eliminar categoría? (se eliminarán todas sus etiquetas)';
        new LabelCategoryResource().del(category_id, confirm_msg);
        Menu.setCategorySelector();
    },


    isBlocker: function(label_category)
    {
        // Nos indica si la categoría es bloqueante
        return label_category.name.toUpperCase() === 'BLOQUEANTES';
    },


    isConnector: function(label_category)
    {
        // Nos indica si la categoría es arista
        return label_category.name.toUpperCase() === 'ARISTAS';
    }
};



var Label = {

    // Para indicar que por defecto no se seleccione el muro al seleccionar la categoría 'Bloqueantes'
    skip_wall_by_default: false,

    show_form_new: function(){
        $e.label.form.root_node.show(400);
        $e.category.form.root_node.hide(400);
        var category = $e.category.selector.val();
        if(category)
            $e.label.form.category.val(category);
    },


    show_form_update: function(){
        // implementar
    },


    create: function()
    {
        //
        // 1. Creamos el registro en la BD
        var category_id = $e.label.form.category.val();
        var data = {
            'name': $e.label.form.name.val(),
            'category': '/api/v1/label-category/' + category_id + '/'
        };

        var label_resource = new Resource('label');
        Menu.label_created = label_resource.create(data);

        //
        // 2. Subimos su imágen
        var img_form = $(this).closest('form');

        if(!img_form.find('input[name=img]').val())
        {
            Label._post_create(label);
            return;
        }

        Menu.sending_img = true;

        label_resource.addImg(
            img_form,
            Menu.label_created.id,
            function(server_response){
                // Una vez que se sube la imágen al servidor..
                Label._post_create();
                Menu.sending_img = false;
            }
        );
    },


    _post_create: function()
    {
        // Limpiamos formulario
        $e.label.form.name.val('');
        $e.label.form.img.val('');

        // Recargamos selector de etiqueta y dejamos elegida la nueva
        Menu.setLabelSelector();

        // Escondemos el formulario para crear la etiqueta
        $e.label.form.root_node.hide(400);

        Menu.label_created = null;
    },


    update: function()
    {

    },


    delete: function()
    {
        var label_id = $e.label.selector.val();
        var confirm_msg = '¿Eliminar etiqueta?';
        new LabelResource().del(label_id, confirm_msg);
        Menu.setLabelSelector();
    },


    isWall: function(label)
    {
        return label.name.toUpperCase() === 'MURO'
            || label.name.toUpperCase() === 'WALL';
    }
};



//
// MENU
//

var Menu = {
    sending_img: false,

    init: function(){
        Menu.labels = new LabelResource().readGrouped();
        Menu._setSelectors();
        Menu.setQrList();
        Menu.setPointStats();
        Events.menu.bind();
    },


    showQR: function(ev)
    {
        ev.preventDefault();
        var item = $(this);
        var row = item.data('point-row');
        var col = item.data('point-col');

        var block = Floor.findBlock(row, col);
        block.find('.qr_info').show();
        block.find('.label_pos').show();

        var offset_x = Floor.block_width * row;
        var offset_y = Floor.block_height * col;
        window.scrollTo(offset_x, offset_y);
    },


    setPointStats: function()
    {
        $e.point_count.to_save.html(Floor.point_count.to_save);
        $e.point_count.saved.html(Floor.point_count.saved);
        $e.point_count.to_delete.html(Floor.point_count.to_delete);
        $e.point_count.total.html(Floor.point_count.total);
    },


    _setSelectors: function()
    {
        // Rellena el selector de categoría de etiqueta y deja el selector para label
        // sólo con la opción 'selecc. etiqueta', ya que de momento no se ha
        // elegido una categoría para la que mostrar sus posibles etiquetas
        this.setCategorySelector();
        this.setLabelSelector();
    },


    setQrList: function()
    {
        // Rellena la lista de QRs creados para la planta

        var list = $e.qr.list;

        if(list)
            list.empty();

        Menu.qr_list = new Resource('qr-code').readAllFiltered('?point__floor__id=' + Floor.data.id);
        for(var i in Menu.qr_list)
        {
            var qr = Menu.qr_list[i];
            list.append(
                '<li>' +
                    '<a href="#" ' +
                    'data-point-row="' + qr.point.row + '"' +
                    'data-point-col="' + qr.point.col + '">' + qr.code + '</a>' +
                '</li>'
            );
        }

        Menu.toggleQRs();
    },


    _fillConnectionsList: function()
    {
        // Rellena la lista de aristas para la planta
    },


    setCategorySelector: function()
    {
        // Recogemos de la B.D. todos los LabelCategory y los metemos en el selector

        Menu.categories = new LabelCategoryResource().readAll();
        var prompt_opt = 'Selecc. categoría';
        setSelector($e.category.selector, Menu.categories, prompt_opt);
        setSelector($e.label.form.category, Menu.categories, prompt_opt);

        // Si se viene de crear una categoría se elije esa
        if(Menu.category_created)
        {
            $e.category.selector.val(Menu.category_created.id);
            $e.label.form.category.val(Menu.category_created.id);
        }

        Menu.setLabelSelector();
    },


    setLabelSelector: function()
    {
        var category_id = $e.category.selector.val();

        if(!category_id)
        {
            setSelector($e.label.selector, null, 'Selecc. etiqueta');
            return;
        }

        Painter.label_category = new LabelCategoryResource().read(category_id);
        Menu.labels = new LabelResource().readAllFiltered('?category__id=' + category_id);

        setSelector($e.label.selector, Menu.labels, 'Selecc. etiqueta');

        // Si se viene de crear una etiqueta se elije esa
        if(Menu.label_created)
            $e.label.selector.val(Menu.label_created.id);

        // Si no, en caso de haber elegido la categoría 'Bloqueantes' se selecciona muro
        else if(LabelCategory.isBlocker(Painter.label_category))
            for(var i in Menu.labels)
            {
                var label = Menu.labels[i];
                if(Label.isWall(label))
                {
                    $e.label.selector.val(label.id);
                    break;
                }
            }

        Painter.setLabel();
    },


    toggleBorders: function()
    {
        // Muestra o no los bordes del bloque según esté o no marcado el checkbox 'ver rejilla'
        if($e.floor.toggle_border.is(':checked'))
        {
            $e.floor.blocks.css({
                'border': '1px solid black',
                'height': $e.floor.blocks.height() - 2 + 'px',
                'width': $e.floor.blocks.width() - 2 + 'px'
            });
        }
        else
        {
            $e.floor.blocks.css({
                'border': '',
                'height': Floor.block_height_initial + 'px',
                'width': Floor.block_width_initial + 'px'
            });
        }
    },


    toggleQRs: function()
    {

//        var not_qr_blocks = $e.floor.blocks.find(':not(.qr_info)').parent();
//        var qr_infos = $e.floor.blocks.find('.qr_info');


        if(Floor.loading)
            return;

        var checkbox = $e.qr.toggle;
        var checkbox_is_checked = $e.qr.toggle.is(':checked');

        checkbox.attr('checked', checkbox_is_checked);

        if(checkbox_is_checked &&
            !confirm('Se perderán los puntos que no se han guardado. ¿Desea continuar?'))
            return;

        Floor.show_only_qrs = checkbox_is_checked;

        Floor.loadGrid();
    }
};
