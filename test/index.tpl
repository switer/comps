<div>
    {%component $id="header" r-component="header"/%}
    {%pagelet $id="main" data-index="0"%}
        <class class="main"></class>
        {%pagelet $id="head" data-index="0"%}
            <class class="head"></class>
        {%/pagelet%}
    {%/pagelet%}
</div>