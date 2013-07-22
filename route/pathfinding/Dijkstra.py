# -*- coding: utf-8 -*-

import sys
import heapq


class Dijkstra():
    floors = []
    walls = []
    qr = []
    mapConnections = {} #Aristas del mapa

    def __init__(self, floors, walls, qr, mapConnections):
        self.floors = floors
        self.walls = walls
        self.qr = qr
        self.mapConnections = mapConnections

    def __dijkstraUsingHeap__(self, adj, s, t):
        ''' Return predecessors and min distance if there exists a shortest path
            from s to t; Otherwise, return None '''
        Q = []     # priority queue of items; note item is mutable.
        d = {s: 0} # vertex -> minimal distance
        Qd = {}    # vertex -> [d[v], parent_v, v]
        p = {}     # predecessor
        visited_set = set([s])
        cost = 1

        for v in adj.get(s, []):
            d[v] = cost
            item = [d[v], s, v]
            heapq.heappush(Q, item)
            Qd[v] = item

        while Q:

            cost, parent, u = heapq.heappop(Q)
            if u not in visited_set:
                p[u] = parent
                visited_set.add(u)
                if u == t:
                    return p, d[u]
                for v in adj.get(u, []):
                    if d.get(v):
                        if d[v] > cost + d[u]:
                            d[v] = cost + d[u]
                            Qd[v][0] = d[v]    # decrease key
                            Qd[v][1] = u       # update predecessor
                            heapq._siftdown(Q, 0, Q.index(Qd[v]))
                    else:
                        d[v] = cost + d[u]
                        item = [d[v], u, v]
                        heapq.heappush(Q, item)
                        Qd[v] = item

        return None

    def __shortestpathUsingHeap__(self, graph, start, end, visited=[], distances={}, predecessors={}):

        predecessors, min_cost = self.__dijkstraUsingHeap__(graph, start, end)
        c = end
        path = [c]

        while predecessors.get(c):
            path.insert(0, predecessors[c])
            c = predecessors[c]

        return [len(path), path]

    #funcion que crea el mapa con las zonas que se pueden pisar o que no, W es muro, E pisable
    # ejemplo 1_1_4: E, 1_1_5 : W, indica que el 1_1_4 es transitable y que el 1_1_5 es muro
    def __createMap__(self):
        map = {}
        for floor in self.floors:
            for row in range(0, floor.num_rows):
                for column in range(0, floor.num_cols):
                    key = "{0}_{1}_{2}".format(row, column, floor.id)
                    if key in self.walls:
                        map[key] = 'W'
                    else:
                        map[key] = 'E'
        return map

    def __existConnection__(self, map, key):
        return key in map and map[key] != 'W'

    @staticmethod
    def getKey(row, column, numfloor):
        return "{0}_{1}_{2}".format(row, column, numfloor)

    #obtiene todas las conexiones de un punto
    def __getConnections__(self, row, column, map, numfloor):

        connection = {}
        keys = [
           # self.getKey(row - 1, column + 1, numfloor), #Northeast  45
           # self.getKey(row + 1, column + 1, numfloor), #Southeast 135
           # self.getKey(row + 1, column - 1, numfloor), #Southwest 225
           # self.getKey(row - 1, column - 1, numfloor), #Northwest 315
            self.getKey(row, column - 1, numfloor), #West 270
            self.getKey(row + 1, column, numfloor), #South 180
            self.getKey(row, column + 1, numfloor), #East 90
            self.getKey(row - 1, column, numfloor), #North 0
        ]
        #mira si el punto tiene conexion con los puntos contiguos (Norte, Sur, Este, Oeste)
        for key in keys:
            if self.__existConnection__(map, key):
                connection[key] = 1
        key = self.getKey(row, column, numfloor)
        #mira si el punto tiene una conexión con otra planta
        if key in self.mapConnections:
            for mapConnection in self.mapConnections[key]:
                connection[mapConnection] = 1

        return connection
    #crea el grafo del mapa
    def __createGraph__(self, map):
        graph = {}

        for floor in self.floors:
            for row in range(0, floor.num_rows):
                for column in range(0, floor.num_cols):
                    key = self.getKey(row, column, floor.id)
                    if map[key] != 'W':
                        #almaceno de cada punto del mapa transitables los puntos a los cuales está conectados
                        graph[key] = self.__getConnections__(row, column, map, floor.id)

        return graph

    def calculateDijkstra(self, errors=[]):
        #creo el mapa con las zonas transitables y los muros
        map = self.__createMap__()
        #creo el grafo es decir meto en un diccionario todas las conexiones que tiene un punto.
        graph = self.__createGraph__(map)
        result = []
        #Ejecuta dijkstra para calcular todas las rutas posibles
        for origin in self.qr:
            for destination in self.qr:
                if origin.point.id != destination.point.id:
                    try:
                        keyorigin = self.getKey(origin.point.row, origin.point.col, origin.point.floor.id)
                        keydestination = self.getKey(destination.point.row, destination.point.col,
                                                     destination.point.floor.id)
                        path = self.__shortestpathUsingHeap__(graph, keyorigin, keydestination
                            , visited=[], distances={}
                            , predecessors={})
                    except Exception as ex:
                        errors.append(
                            '--Imposible encontrar camino entre camino entre {0} y {1} ex: {2}--'.format(keyorigin,
                                                                                                         keydestination,
                                                                                                         ex.args))
                        print type(ex)
                        print ex.args
                    else:
                        #Añade la ruta al resultado
                        if path is not None:
                            result.append([origin, destination, path])

        return result

