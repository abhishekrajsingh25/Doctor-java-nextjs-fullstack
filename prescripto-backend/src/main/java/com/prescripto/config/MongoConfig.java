package com.prescripto.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.prescripto.repository")
public class MongoConfig {
    // MongoDB auto-configured via application.yml
}
