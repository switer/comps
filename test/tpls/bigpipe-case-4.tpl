<div>
    {% pagelet $id="header" %}
        {% component $id="header" $replace="true" /%}
    {% /pagelet %}
    {% chunk $id="header" $require="header,list" /%}
    <div class="list">list</div>
    {% chunk $id="list" $require="header" /%}
</div>