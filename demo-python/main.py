#!/usr/bin/env python
from constructs import Construct
from cdk8s import App, Chart

from glob import glob
from imports import k8s
import json

class MyChart(Chart):
    def __init__(self, scope: Construct, id: str):
        super().__init__(scope, id)

        # define resources here
        label = {"app": "hello-k8s"}


        for file in glob('./data/*.json'):
            with open(file) as json_file:
                team = json.load(json_file)
                for namespace in team['namespaces']:
                    k8s.KubeNamespace(self, namespace,
                        metadata=k8s.ObjectMeta(
                            name=namespace,
                            annotations={
                                "owner": team['name'],
                                "slack": team['slack']
                            }
                        )
                    )                

        k8s.KubeDeployment(self, 'deployment',
            spec=k8s.DeploymentSpec(
                replicas=1,
                selector=k8s.LabelSelector(match_labels=label),
                template=k8s.PodTemplateSpec(
                    metadata=k8s.ObjectMeta(labels=label),
                    spec=k8s.PodSpec(containers=[
                        k8s.Container(
                        name='hello-kubernetes',
                        image='paulbouwer/hello-kubernetes:1.7',
                        ports=[k8s.ContainerPort(container_port=8080)])]
                    )
                )
            )
        )

app = App()
MyChart(app, "files")

app.synth()
