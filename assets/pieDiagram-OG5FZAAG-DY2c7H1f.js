import{c as ee}from"./chunk-JQRUD6KW-CgAQKxej.js";import{l as te}from"./cynefin-VYW2F7L2-2VAHYKR6-0uPj3aqg.js";import{n as ae,h as re,a as ie,l as le,g as se,d as oe,m as o,p as R,M as ne,L as de,a1 as pe,a2 as ce,a3 as I,a4 as he,o as ge,s as ue,a5 as me,w as fe}from"./bootstrap-DgGQwLFu.js";import"./preload-helper-PPVm8Dsz.js";import"./_lwc-implicit-empty-template-mXddYNJE.js";var we=fe.pie,z={sections:new Map,showData:!1},k=z.sections,H=z.showData,xe=structuredClone(we),$e=o(()=>structuredClone(xe),"getConfig"),ve=o(()=>{k=new Map,H=z.showData,ue()},"clear"),Se=o(({label:e,value:a})=>{if(a<0)throw new Error(`"${e}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);k.has(e)||(k.set(e,a),R.debug(`added new section: ${e}, with value: ${a}`))},"addSection"),be=o(()=>k,"getSections"),ye=o(e=>{H=e},"setShowData"),Ce=o(()=>H,"getShowData"),V={getConfig:$e,clear:ve,setDiagramTitle:oe,getDiagramTitle:se,setAccTitle:le,getAccTitle:ie,setAccDescription:re,getAccDescription:ae,addSection:Se,getSections:be,setShowData:ye,getShowData:Ce},ke=o((e,a)=>{ee(e,a),a.setShowData(e.showData),e.sections.map(a.addSection)},"populateDb"),De={parse:o(async e=>{let a=await te("pie",e);R.debug(a),ke(a,V)},"parse")},Te=o(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,"getStyles"),Ae=Te,Me=o(e=>{let a=[...e.values()].reduce((d,g)=>d+g,0),B=[...e.entries()].map(([d,g])=>({label:d,value:g})).filter(d=>d.value/a*100>=1);return me().value(d=>d.value).sort(null)(B)},"createPieArcs"),Oe=o((e,a,B,d)=>{R.debug(`rendering pie chart
`+e);let g=d.db,F=ne(),u=de(g.getConfig(),F.pie),L=40,i=18,n=4,S=450,x=S,D=pe(a),b=D.append("g");b.attr("transform","translate("+x/2+","+S/2+")");let{themeVariables:l}=F,[P]=ce(l.pieOuterStrokeWidth);P??=2;let _=u.legendPosition,W=u.textPosition,q=u.donutHole>0&&u.donutHole<=.9?u.donutHole:0,m=Math.min(x,S)/2-L,J=I().innerRadius(q*m).outerRadius(m),K=I().innerRadius(m*W).outerRadius(m*W),$=b.append("g");$.append("circle").attr("cx",0).attr("cy",0).attr("r",m+P/2).attr("class","pieOuterCircle");let y=g.getSections(),Q=Me(y),U=[l.pie1,l.pie2,l.pie3,l.pie4,l.pie5,l.pie6,l.pie7,l.pie8,l.pie9,l.pie10,l.pie11,l.pie12],T=0;y.forEach(t=>{T+=t});let E=Q.filter(t=>(t.data.value/T*100).toFixed(0)!=="0"),A=he(U).domain([...y.keys()]);$.selectAll("mySlices").data(E).enter().append("path").attr("d",J).attr("fill",t=>A(t.data.label)).attr("class",t=>{let r="pieCircle";return u.highlightSlice==="hover"?r+=" highlightedOnHover":u.highlightSlice===t.data.label&&(r+=" highlighted"),r}),$.selectAll("mySlices").data(E).enter().append("text").text(t=>(t.data.value/T*100).toFixed(0)+"%").attr("transform",t=>"translate("+K.centroid(t)+")").style("text-anchor","middle").attr("class","slice");let X=b.append("text").text(g.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),v=[...y.entries()].map(([t,r])=>({label:t,value:r})),f=b.selectAll(".legend").data(v).enter().append("g").attr("class","legend");f.append("rect").attr("width",i).attr("height",i).style("fill",t=>A(t.label)).style("stroke",t=>A(t.label)),f.append("text").attr("x",i+n).attr("y",i-n).text(t=>g.getShowData()?`${t.label} [${t.value}]`:t.label);let w=Math.max(...f.selectAll("text").nodes().map(t=>t?.getBoundingClientRect().width??0)),C=S,M=x+L,s=i+n,O=v.length*s;switch(_){case"center":f.attr("transform",(t,r)=>{let p=s*v.length/2,c=-w/2-(i+n),h=r*s-p;return"translate("+c+","+h+")"});break;case"top":C+=O,f.attr("transform",(t,r)=>{let p=m,c=-w/2-(i+n),h=r*s-p;return`translate(${c}, ${h})`}),$.attr("transform",()=>`translate(0, ${O+s})`);break;case"bottom":C+=O,f.attr("transform",(t,r)=>{let p=-m-s,c=-w/2-(i+n),h=r*s-p;return"translate("+c+","+h+")"});break;case"left":M+=i+n+w,f.attr("transform",(t,r)=>{let p=s*v.length/2,c=-m-(i+n),h=r*s-p;return"translate("+c+","+h+")"}),$.attr("transform",()=>`translate(${w+i+n}, 0)`);break;default:M+=i+n+w,f.attr("transform",(t,r)=>{let p=s*v.length/2,c=12*i,h=r*s-p;return"translate("+c+","+h+")"});break}let N=X.node()?.getBoundingClientRect().width??0,Y=x/2-N/2,Z=x/2+N/2,j=Math.min(0,Y),G=Math.max(M,Z)-j;D.attr("viewBox",`${j} 0 ${G} ${C}`),ge(D,C,G,u.useMaxWidth)},"draw"),Re={draw:Oe},Pe={parser:De,db:V,renderer:Re,styles:Ae};export{Pe as diagram};
