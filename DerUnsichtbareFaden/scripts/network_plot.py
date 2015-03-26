'''
Created on 18.03.2015

@author: kolbe
'''
from server import app, db
from server.models import Article, Node
import networkx as nx
import matplotlib.pyplot as plt
import numpy as np
from mayavi import mlab

def draw_graph3d(graph, graph_colormap='summer', bgcolor = (0, 0, 0),
                 node_size=0.05,
                 edge_color=(0.5, 0.5, 0.5), edge_size=0.0005,
                 text_size=0.004, text_color=(1, 1, 1)):

    H=nx.Graph()

    # add edges
    for node, edges in graph.items():
        for edge, val in edges.items():
            if val == 1:
                H.add_edge(node, edge)

    G=nx.convert_node_labels_to_integers(H)
    #G=H

    graph_pos=nx.random_layout(G, dim=3)

    # numpy array of x,y,z positions in sorted node order
    xyz=np.array([graph_pos[v] for v in sorted(G)])

    # scalar colors
    scalars=np.array(G.nodes())+5
    mlab.figure(1, bgcolor=bgcolor)
    mlab.clf()

    pts = mlab.points3d(xyz[:,0], xyz[:,1], xyz[:,2],
                        scalars,
                        scale_factor=node_size,
                        scale_mode='none',
                        colormap=graph_colormap,
                        resolution=20)

    mlab.figure(1).scene.disable_render = True
    for i, (x, y, z) in enumerate(xyz):
        label = mlab.text(x, y, graph.keys()[i], z=z,
                          width=len(graph.keys()[i])*text_size, name=str(i), color=text_color)
        label.property.shadow = False
    

    pts.mlab_source.dataset.lines = np.array(G.edges())
    tube = mlab.pipeline.tube(pts, tube_radius=edge_size)
    mlab.pipeline.surface(tube, color=edge_color)
    
    mlab.figure(1).scene.disable_render = False

    mlab.show() # interactive window


if __name__ == '__main__':
    
    nodes = Node.query.all()
    edges = []
    for n in nodes:
        for t in n.targets:
            if t in nodes:
                edges.append((n.id, t.id))
    
    print nodes
    print edges
    '''
    G=nx.Graph()

    # add nodes
    for node in nodes:
        G.add_node(node.id, label=node.name)

    # add edges
    for e in edges:
        G.add_edge(e[0], e[1])
    
    # draw graph
    pos = nx.spring_layout(G)
    labels = {}
    for n, i in zip(nodes, range(len(nodes))):
        labels[n.id] = n.name
        
    
    #nx.draw_networkx_labels(G, pos, labels,font_size=16)
    nx.draw(G, pos)
    plt.axis('off')
    plt.show() # display
    '''
    
    nodes_3d = {}
    for n in nodes:
        edges = {}
        for t in n.targets:
            if t in nodes:
                edges[t.name] = 1
        nodes_3d[n.name] = edges
    
    draw_graph3d(nodes_3d)