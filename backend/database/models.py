"""
MediSim AI - ORM Database Models
Author: Team BioNex - VIT Bhopal University
Purpose: Persist user credentials, consent tracking, simulation history, and PDF reports.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .connection import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    consent_given = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    simulations = relationship("SimulationHistory", back_populates="user", cascade="all, delete-orphan")


class SimulationHistory(Base):
    __tablename__ = "simulation_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    drug_name = Column(String(255), nullable=False)
    simulation_type = Column(String(100), default="liver-toxicity")
    predicted_class = Column(String(255), nullable=True)
    patient_age = Column(Float, nullable=True)
    patient_sex = Column(String(50), nullable=True)
    patient_bmi = Column(Float, nullable=True)
    ast = Column(Float, nullable=True)
    alt = Column(Float, nullable=True)
    results_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="simulations")


class ReportRecord(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    simulation_id = Column(Integer, nullable=True)
    drug_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
