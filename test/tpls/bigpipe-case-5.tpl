<div>
    {% component $id="header" $replace="true" /%}
    {% chunk $id="header" $require="header" /%}
    <div class="list">list</div>
    {% pagelet $id="header" %}
        {% chunk $id="list" $require="list, header" /%}
    {% /pagelet %}
</div>